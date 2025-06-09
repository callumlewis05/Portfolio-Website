-- Returns a count of the number of times a given username occurs in the database.
SELECT COUNT(*) FROM accounts WHERE username = %s