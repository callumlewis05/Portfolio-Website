-- Drops all tables in reverse order.
DROP TABLE IF EXISTS game_stats;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS accounts;

-- Creates the user table with a user ID, username and password.
CREATE TABLE accounts (
  user_id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  sign_up_date DATE
);

-- Creates the wallets table so that the database remains in 3nf as wallet is dependent on user_id.
CREATE TABLE wallets (
  user_id INTEGER,
  wallet INTEGER,
  FOREIGN KEY (user_id) REFERENCES accounts(user_id)
);

-- Creates the games table with a game ID and the date and time of each game,
-- which table the game was played on along with the user ID to associate each game with a user.
CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  user_id SERIAL,
  date_of_game DATE,
  time_of_game TIME,
  game_table TEXT,
  FOREIGN KEY (user_id) REFERENCES accounts(user_id)
);

-- Creates the game stats table with number of hands and the net and average 
-- profit/loss per game along with the game ID to associate it with the games table.
CREATE TABLE game_stats (
  game_id INTEGER,
  number_of_hands INTEGER,
  net_profit_loss INTEGER,
  average_profit_loss INTEGER,
  FOREIGN KEY (game_id) REFERENCES games(game_id)
);