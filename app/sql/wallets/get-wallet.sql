-- Selects the wallet for the given user_id.
SELECT wallet
FROM wallets
WHERE user_id = %s