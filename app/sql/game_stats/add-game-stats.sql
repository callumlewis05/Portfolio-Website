-- Adds the game stats to the 'game_stats' table.
INSERT INTO game_stats (
        game_id,
        number_of_hands,
        net_profit_loss,
        average_profit_loss
    )
VALUES (%s, 0, 0, 0);