-- 適用前に、同じ席の進行中セッションが重複していないことを確認する。
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_session_per_seat
    ON seat_sessions (seat_id)
    WHERE end_at IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_orders_quantity'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT ck_orders_quantity
            CHECK (quantity >= 1 AND quantity < 20);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_user_request_login_id
    ON user_requests (login_id)
    WHERE status = 'pending';
