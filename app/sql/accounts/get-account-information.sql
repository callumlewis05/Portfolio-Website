-- Selects the user_id and sign_up_date for the given username.
SELECT user_id, sign_up_date
FROM accounts
WHERE username = %s