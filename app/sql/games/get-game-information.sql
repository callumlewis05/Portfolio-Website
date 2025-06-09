-- Selects game information for the given game_id.
SELECT user_id, date_of_game, time_of_game, game_table
FROM games
WHERE game_id = %s