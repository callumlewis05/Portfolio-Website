-- Selects the game stats for the specified 'game_id'.
SELECT number_of_hands,
    net_profit_loss,
    average_profit_loss
FROM game_stats
WHERE game_id = %s;