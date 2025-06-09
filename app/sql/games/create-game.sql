-- Adds a game to the games table.
INSERT INTO games (
        user_id,
        date_of_game,
        time_of_game,
        game_table
    )
VALUES (%s, CURRENT_DATE, CURRENT_TIME, %s);