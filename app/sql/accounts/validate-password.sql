-- Selects the password and salt for the given username.
SELECT password, salt
FROM accounts
WHERE username = %s