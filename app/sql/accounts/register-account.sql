-- Adds the user to the accounts table.
INSERT INTO accounts (username, password, salt, sign_up_date)
VALUES (%s, %s, %s, CURRENT_DATE);