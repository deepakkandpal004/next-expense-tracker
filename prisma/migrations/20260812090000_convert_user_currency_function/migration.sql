-- Atomically convert every stored amount for a user to a target currency.
-- Runs entirely inside PostgreSQL so it works through the Supabase transaction
-- pooler (port 6543), which cannot carry Prisma interactive transactions.
--
-- Returns:
--   'already'   -> the user's currency is already the target
--   'conflict'  -> the currency changed underneath us; refuse to guess
--   'converted:N' -> converted N stored amounts and updated the user currency
CREATE OR REPLACE FUNCTION convert_user_currency(
  p_user_id TEXT,
  p_expected_currency TEXT,
  p_target_currency TEXT,
  p_rate DOUBLE PRECISION
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_currency TEXT;
  v_rows BIGINT;
  v_converted BIGINT := 0;
BEGIN
  -- Lock the user row so concurrent requests serialize: a second request
  -- waits until the first commits and then sees the new currency, preventing
  -- the same amounts from being converted twice.
  SELECT UPPER(COALESCE("currency", 'INR'))
    INTO v_currency
    FROM "User"
   WHERE "id" = p_user_id
   FOR UPDATE;

  IF v_currency = UPPER(p_target_currency) THEN
    RETURN 'already';
  END IF;

  IF v_currency <> UPPER(p_expected_currency) THEN
    RETURN 'conflict';
  END IF;

  UPDATE "Record"
     SET "amount" = ROUND(CAST("amount" * p_rate * 1e6 AS NUMERIC)) / 1e6
   WHERE "userId" = p_user_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  v_converted := v_converted + v_rows;

  UPDATE "RecurringRecord"
     SET "amount" = ROUND(CAST("amount" * p_rate * 1e6 AS NUMERIC)) / 1e6
   WHERE "userId" = p_user_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  v_converted := v_converted + v_rows;

  UPDATE "Goal"
     SET "targetAmount" = ROUND(CAST("targetAmount" * p_rate * 1e6 AS NUMERIC)) / 1e6,
         "currentAmount" = ROUND(CAST("currentAmount" * p_rate * 1e6 AS NUMERIC)) / 1e6,
         "monthlyContribution" = ROUND(CAST("monthlyContribution" * p_rate * 1e6 AS NUMERIC)) / 1e6
   WHERE "userId" = p_user_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  v_converted := v_converted + v_rows;

  UPDATE "Budget"
     SET "amount" = ROUND(CAST("amount" * p_rate * 1e6 AS NUMERIC)) / 1e6,
         "currency" = UPPER(p_target_currency)
   WHERE "userId" = p_user_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  v_converted := v_converted + v_rows;

  UPDATE "User"
     SET "currency" = UPPER(p_target_currency)
   WHERE "id" = p_user_id;

  RETURN 'converted:' || v_converted::TEXT;
END;
$$;
