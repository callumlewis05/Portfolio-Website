-- Updates the wallet value for the given `username`.
UPDATE wallets
SET wallet = %s
WHERE user_id = %s;