-- Updates the game stats for the specified `game_id`.
UPDATE game_stats
SET number_of_hands = number_of_hands + 1,
    net_profit_loss = %s,
    average_profit_loss = %s
WHERE game_id = %s;