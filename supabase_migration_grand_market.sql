-- ============================================
-- Grand Market: Online Player-Based Trading
-- ============================================

-- Market offers table (buy and sell offers from real players)
CREATE TABLE IF NOT EXISTS market_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Unknown',
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_item INTEGER NOT NULL CHECK (price_per_item > 0),
  fulfilled INTEGER NOT NULL DEFAULT 0,
  collected_items INTEGER NOT NULL DEFAULT 0,
  collected_coins INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_market_offers_user ON market_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_market_offers_item ON market_offers(item_id, status);
CREATE INDEX IF NOT EXISTS idx_market_offers_status ON market_offers(status);
CREATE INDEX IF NOT EXISTS idx_market_offers_type_item ON market_offers(type, item_id, status, price_per_item);

-- Market trade history (completed transactions)
CREATE TABLE IF NOT EXISTS market_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL DEFAULT 'Unknown',
  seller_name TEXT NOT NULL DEFAULT 'Unknown',
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_item INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  traded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_history_item ON market_history(item_id, traded_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_history_buyer ON market_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_market_history_seller ON market_history(seller_id);

-- Market slots per user (default 3, max 6)
CREATE TABLE IF NOT EXISTS market_slots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slots INTEGER NOT NULL DEFAULT 3
);

-- Enable Row Level Security
ALTER TABLE market_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_offers
-- Anyone can read active offers (to browse and match)
CREATE POLICY "Anyone can view active offers" ON market_offers
  FOR SELECT USING (true);

-- Users can insert their own offers
CREATE POLICY "Users can create own offers" ON market_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own offers (cancel, collect)
CREATE POLICY "Users can update own offers" ON market_offers
  FOR UPDATE USING (auth.uid() = user_id);

-- System can update any offer (for matching) — use service role for this
-- For client-side matching, we allow users to update others' offers only for fulfillment
CREATE POLICY "Anyone can update offers for matching" ON market_offers
  FOR UPDATE USING (true);

-- RLS Policies for market_history
-- Anyone can read trade history
CREATE POLICY "Anyone can view trade history" ON market_history
  FOR SELECT USING (true);

-- System/users can insert trade history
CREATE POLICY "Authenticated users can insert history" ON market_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for market_slots
CREATE POLICY "Users can view own slots" ON market_slots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own slots" ON market_slots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own slots" ON market_slots
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Function: Match buy/sell offers automatically
-- Called after creating a new offer
-- ============================================
CREATE OR REPLACE FUNCTION match_market_offers(
  p_offer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_offer RECORD;
  v_match RECORD;
  v_fill_amount INTEGER;
  v_remaining INTEGER;
  v_matches JSONB := '[]'::JSONB;
BEGIN
  -- Get the new offer
  SELECT * INTO v_offer FROM market_offers WHERE id = p_offer_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN v_matches;
  END IF;

  v_remaining := v_offer.quantity - v_offer.fulfilled;

  IF v_offer.type = 'buy' THEN
    -- Find matching sell offers (cheapest first)
    FOR v_match IN
      SELECT * FROM market_offers
      WHERE item_id = v_offer.item_id
        AND type = 'sell'
        AND status = 'active'
        AND price_per_item <= v_offer.price_per_item
        AND user_id != v_offer.user_id
      ORDER BY price_per_item ASC, created_at ASC
    LOOP
      EXIT WHEN v_remaining <= 0;

      v_fill_amount := LEAST(v_remaining, v_match.quantity - v_match.fulfilled);
      IF v_fill_amount <= 0 THEN CONTINUE; END IF;

      -- Update buy offer (the new one)
      UPDATE market_offers SET
        fulfilled = fulfilled + v_fill_amount,
        collected_items = collected_items + v_fill_amount,
        status = CASE WHEN fulfilled + v_fill_amount >= quantity THEN 'completed' ELSE 'active' END
      WHERE id = v_offer.id;

      -- Update sell offer (the matching one)
      UPDATE market_offers SET
        fulfilled = fulfilled + v_fill_amount,
        collected_coins = collected_coins + (v_fill_amount * v_match.price_per_item),
        status = CASE WHEN fulfilled + v_fill_amount >= quantity THEN 'completed' ELSE 'active' END
      WHERE id = v_match.id;

      -- Record trade history
      INSERT INTO market_history (buyer_id, seller_id, buyer_name, seller_name, item_id, quantity, price_per_item, total_price)
      VALUES (v_offer.user_id, v_match.user_id, v_offer.username, v_match.username, v_offer.item_id, v_fill_amount, v_match.price_per_item, v_fill_amount * v_match.price_per_item);

      v_remaining := v_remaining - v_fill_amount;

      v_matches := v_matches || jsonb_build_object(
        'matched_offer_id', v_match.id,
        'fill_amount', v_fill_amount,
        'price', v_match.price_per_item
      );
    END LOOP;

  ELSIF v_offer.type = 'sell' THEN
    -- Find matching buy offers (highest price first)
    FOR v_match IN
      SELECT * FROM market_offers
      WHERE item_id = v_offer.item_id
        AND type = 'buy'
        AND status = 'active'
        AND price_per_item >= v_offer.price_per_item
        AND user_id != v_offer.user_id
      ORDER BY price_per_item DESC, created_at ASC
    LOOP
      EXIT WHEN v_remaining <= 0;

      v_fill_amount := LEAST(v_remaining, v_match.quantity - v_match.fulfilled);
      IF v_fill_amount <= 0 THEN CONTINUE; END IF;

      -- Update sell offer (the new one)
      UPDATE market_offers SET
        fulfilled = fulfilled + v_fill_amount,
        collected_coins = collected_coins + (v_fill_amount * v_offer.price_per_item),
        status = CASE WHEN fulfilled + v_fill_amount >= quantity THEN 'completed' ELSE 'active' END
      WHERE id = v_offer.id;

      -- Update buy offer (the matching one)
      UPDATE market_offers SET
        fulfilled = fulfilled + v_fill_amount,
        collected_items = collected_items + v_fill_amount,
        status = CASE WHEN fulfilled + v_fill_amount >= quantity THEN 'completed' ELSE 'active' END
      WHERE id = v_match.id;

      -- Record trade history
      INSERT INTO market_history (buyer_id, seller_id, buyer_name, seller_name, item_id, quantity, price_per_item, total_price)
      VALUES (v_match.user_id, v_offer.user_id, v_match.username, v_offer.username, v_offer.item_id, v_fill_amount, v_offer.price_per_item, v_fill_amount * v_offer.price_per_item);

      v_remaining := v_remaining - v_fill_amount;

      v_matches := v_matches || jsonb_build_object(
        'matched_offer_id', v_match.id,
        'fill_amount', v_fill_amount,
        'price', v_offer.price_per_item
      );
    END LOOP;
  END IF;

  RETURN v_matches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- View: Recent trades for all items (public live feed)
-- ============================================
CREATE OR REPLACE VIEW market_recent_trades AS
SELECT
  id,
  buyer_name,
  seller_name,
  item_id,
  quantity,
  price_per_item,
  total_price,
  traded_at
FROM market_history
ORDER BY traded_at DESC
LIMIT 100;

-- ============================================
-- View: Item price summary (avg price last 24h)
-- ============================================
CREATE OR REPLACE VIEW market_price_summary AS
SELECT
  item_id,
  COUNT(*) as trade_count,
  AVG(price_per_item)::INTEGER as avg_price,
  MIN(price_per_item) as min_price,
  MAX(price_per_item) as max_price,
  SUM(quantity) as total_volume
FROM market_history
WHERE traded_at > now() - INTERVAL '24 hours'
GROUP BY item_id;

-- Enable realtime for market_offers so clients get live updates
ALTER PUBLICATION supabase_realtime ADD TABLE market_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE market_history;
