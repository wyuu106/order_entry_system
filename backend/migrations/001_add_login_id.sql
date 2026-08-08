BEGIN;

ALTER TABLE users ADD COLUMN login_id VARCHAR;
UPDATE users SET login_id = name;
ALTER TABLE users ALTER COLUMN login_id SET NOT NULL;
CREATE UNIQUE INDEX ix_users_login_id ON users (login_id);

ALTER TABLE user_requests ADD COLUMN login_id VARCHAR;
UPDATE user_requests SET login_id = name;
ALTER TABLE user_requests ALTER COLUMN login_id SET NOT NULL;

COMMIT;
