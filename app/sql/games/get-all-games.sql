-- Selects the game information from the `games` and `game_stats` tables and joins them together through the `game_id`.
SELECT g.date_of_game, g.time_of_game, gs.number_of_hands, gs.net_profit_loss, gs.average_profit_loss, g.game_table
FROM games g
JOIN game_stats gs ON g.game_id = gs.game_id
WHERE g.user_id = %s;