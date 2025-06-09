-- Sets the user's wallet to 0 when they register.
INSERT INTO wallets (user_id, wallet)
VALUES (%s, 100);