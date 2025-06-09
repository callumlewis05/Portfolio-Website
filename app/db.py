import psycopg2
import os
import datetime
import uuid
from .hash import hash
from typing import Dict, Union
from dotenv import load_dotenv


# ======================
# Database/SQL functions
# ======================

# Load the .env file
load_dotenv()

# Gets the connection information of the database from the environment variables.
DATABASE_NAME = os.getenv('DATABASE_NAME')
DATABASE_USER = os.getenv('DATABASE_USER')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
DATABASE_HOST = os.getenv('DATABASE_HOST')


# Establishes a connection to the database.
connection = psycopg2.connect(
    dbname=DATABASE_NAME,
    user=DATABASE_USER,
    password=DATABASE_PASSWORD,
    host=DATABASE_HOST
)

# Establishes a cursor to execute SQL queries.
cursor = connection.cursor()


def get_sql_script(filename: str) -> str:
    """
    Gets and returns the SQL script for the given file.

    Args:
        filename (str): Name of the file containing the SQL script.

    Returns:
        str: The SQL script as a string.

    Example:
        >>> sql_script = get_sql_script("example.sql")
        SELECT * FROM example_table WHERE condition = 'example';
    """
    # Get the directory path of the current file.
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Navigates to the SQL folder and selects the file.
    sql_file_path = os.path.join(current_dir, f'sql/{filename}')

    # Opens, reads and stores the SQL script.
    with open(sql_file_path, 'r') as sql_file:
        sql_script = sql_file.read()

    # Return the SQL script.
    return sql_script


def create_tables():
    """
    Gets and executes the SQL script to create the database tables.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> createTables()
    """
    # Attempts to get and execute the SQL script to create the tables in the database.
    try:
        # Gets and executes the SQL script to create the tables in the database.
        sql_script = get_sql_script("general/schema.sql")
        cursor.execute(sql_script)

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise


# ==========================
# 'accounts' table functions
# ==========================
def add_user(username: str, password: str) -> bool:
    """
    Gets and executes the SQL script to add a user to the database tables.

    Args:
        username (str): The username of the user to be added to the database.
        password (str): The password of the user to be added to the database.

    Returns:
        bool: True if the user was successfully registered in the database, False otherwise.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> add_user("username", "password")
        True
    """
    # Sets whether the user has been added to the database to false.
    registered = False

    # Attempts to get and execute the SQL scripts to add a user to the 'accounts'
    # table and register a wallet in the 'wallets' table.
    try:
        # Gets and executes the SQL script to check if the username is already
        # registered in the database.
        sql_script = get_sql_script("accounts/validate-username.sql")
        cursor.execute(sql_script, (username,))

        # Stores the amount of times a given username appears in the database.
        user_count = cursor.fetchone()

        # If the username appears more than 0 times in the database,
        # then the user exists.
        username_taken = user_count[0] > 0

        # If the username is not taken, add the user to the database and
        # creates a wallet for that user.
        if not username_taken:
            salt = uuid.uuid4().hex
            # Gets and executes the SQL script to add a user to the database.
            sql_account_script = get_sql_script(
                "accounts/register-account.sql")
            cursor.execute(sql_account_script,
                           (username, hash(password, salt), salt))

            # Gets the user_id to use in creating a wallet for that user.
            sql_user_id_script = get_sql_script(
                "accounts/get-account-information.sql")
            cursor.execute(sql_user_id_script, (username,))
            user_id = cursor.fetchone()[0]

            # Gets and executes the SQL script to create a wallet for the user.
            sql_create_wallet_script = get_sql_script(
                "wallets/create-wallet.sql")
            cursor.execute(sql_create_wallet_script, (user_id,))

            # Defines a boolean stating the user has been registered in the database.
            registered = True

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database or executing SQL: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns whether the user has been added to the database.
    return registered


def validate_username(username: str) -> bool:
    """
    Checks if the given username appears in the database.

    Args:
        username (str): The username to be validated.

    Returns:
        bool: A boolean indicating whether the username appears in the database.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> validate_username("username")
        True
    """
    # Attempts to get and execute the SQL script to check if the given username
    # appears in the database.
    try:
        # Gets and executes the SQL script to check how many times a username
        # appears in the database.
        sql_script = get_sql_script("accounts/validate-username.sql")
        cursor.execute(sql_script, (username,))

        # Stores how many times a username appears in the database
        user_count = cursor.fetchone()

        # If the username appears more than 0 times in the database,
        # then the user exists.
        user_exists = user_count[0] > 0

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database or executing SQL: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns whether the user exists.
    return user_exists


def validate_password(username: str, password: str) -> bool:
    """
    Checks if the given password is the password of the account associated with the given username.

    Args:
        username (str): The username of the user whose password is to be validated.
        password (str): The password to be validated.

    Returns:
        bool: A boolean indicating whether the password is correct.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> validate_password("username", "password")
        True
    """
    # Attempts to get and execute the SQL script to check if the hash of the given password
    # matches the hash of the password in the database.
    try:
        # Gets and executes the SQL script to get the stored password for the given username.
        sql_script = get_sql_script("accounts/validate-password.sql")
        cursor.execute(sql_script, (username,))

        # Gets the password hash and salt from the database for the given username.
        results = cursor.fetchone()
        stored_password = results[0]
        stored_salt = results[1]

        # Updates the password to be the hash of the given password.
        password = hash(password, stored_salt)

        # Checks if the hash of the given password matches the hash of the password in the database.
        correct_password = stored_password == password

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database or executing SQL: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns whether the password is correct.
    return correct_password


def get_account_information(username: str) -> Dict[str, Union[int, str]]:
    """
    Gets and executes the SQL script to get the account information for the given username.

    Args:
        username (str): The username of the account for which the account information is to be retrieved.

    Returns:
        Dict[str, Union[int, str]]: A dictionary containing the following keys:
            - "wallet" (int): The user's wallet balance.
            - "sign_up_date" (str): The user's sign-up date in the format 'dd-mm-yyyy'.
            - "user_id" (int): The user's ID in the database.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> account_info = get_account_info("username")
        {
            "wallet": 100,
            "sign_up_date": 01-01-2000,
            "user_id": 1
        }
    """
    # Attempts to get and execute the SQL script to get the user information from the database.
    try:
        # Gets and executes the SQL script to get the 'user_id' and 'sign_up_date'.
        sql_get_sign_up_date_script = get_sql_script(
            "accounts/get-account-information.sql")
        cursor.execute(sql_get_sign_up_date_script, (username,))
        row = cursor.fetchone()

        # Stores the 'user_id' and 'sign_up_date' for the given account in variables.
        user_id, sign_up_date = row[0], row[1]

        # Gets and executes the SQL script to get the wallet value for the given username.
        sql_wallet_script = get_sql_script("wallets/get-wallet.sql")
        cursor.execute(sql_wallet_script, (user_id,))
        wallet = cursor.fetchone()[0]

        # Stores the wallet and sign-up date in a dictionary.
        account_information = {
            "wallet": wallet,
            "sign_up_date": sign_up_date.strftime('%d-%m-%Y'),
            "user_id": user_id
        }

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database or executing SQL: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns a dictionary with the account information.
    return account_information


# =======================
# 'games' table functions
# =======================
def create_game(user_id: int, game_table: str):
    """
    Gets and executes the SQL script to create a game in the database table 'games'.

    Args:
        user_id (int): The user_id of the user currently playing the game that is to be created in the database.
        game_table (int): The table that the user is currently playing the game on.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> create_game(1, "High")
    """
    # Attempts to get and execute the SQL script to create a game in the database.
    try:
        # Gets and executes the SQL script to create a game in the database.
        sql_script = get_sql_script("games/create-game.sql")
        cursor.execute(sql_script, (user_id, game_table))

        # Fetches the game_id of the last inserted game
        cursor.execute("SELECT lastval();")
        game_id = cursor.fetchone()[0]

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database or executing SQL: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns the `game_id` of the most recently created game.
    return game_id


def get_game_information(game_id: int) -> Dict[str, Union[int, datetime.date, datetime.time, str]]:
    """
    Gets and executes the SQL script to get the game data in the database.

    Args:
        user_id (int): The game_id of the requested game.

    Returns:
        Dict[str, Union[int, datetime.date, datetime.time]]: A dictionary containing the following keys:
            - "user_id" (int): The 'user_id' of the user who played the game.
            - "date_of_game" (datetime.date): The date of when the game started.
            - "time_of_game" (datetime.time): The time of when the game started.
            - "game_table" (str): The table that the game was played on.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> get_game_information(1)
        {
            "user_id": 1,
            "date_of_game": "2024-03-17",
            "time_of_game": "14:13:58.806364",
            "game_table": "Low"
        }
    """
    # Attempts to get and execute the SQL script to get the game information for the given
    # 'game_id' from the database.
    try:
        # Gets and executes the SQL script to get the game information for the given
        # 'game_id' from the database
        sql_script = get_sql_script("games/get-game-information.sql")
        cursor.execute(sql_script, (game_id,))

        # Gets and stores the game information in a dictionary.
        information = cursor.fetchone()
        game_information = {
            "user_id": information[0],
            "date_of_game": information[1],
            "time_of_game": information[2],
            "game_table": information[3]
        }

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns the game information.
    return game_information


def get_all_games(user_id) -> list[list]:
    """
    Gets and executes the SQL script to get the game data in the database.

    Args:
        user_id (int): The game_id of the requested game.

    Returns:
        list[list]: A list of lists containing game information. Each inner list represents a game record
                   with its corresponding attributes.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> get_game_information(1)
    """
    # Attempts to get and execute the SQL script to get the game information for all games from the database.
    try:
        # Gets and executes the SQL script to get the game information for the given
        # 'game_id' from the database by joining the `game_id` from the game_stats and games tables.
        sql_script = get_sql_script("games/get-all-games.sql")
        cursor.execute(sql_script, (user_id,))

        # Gets and stores the game information in a dictionary.
        games = cursor.fetchall()

        # Converts all the tuples to a two-dimensional list
        games = [list(row) for row in games]

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns the game information.
    return games


# ============================
# 'game_stats' table functions
# ============================
def add_game_stats(game_id: int):
    """
    Adds a new record to the 'game_stats' table.

    Args:
        game_id (int): The game_id of the game whose stats are to be added to the database.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> add_game_stats(1)
    """
    # Attempts to get and execute the SQL script to add the game stats for the given 'game_id'
    # to the database.
    try:
        # Gets and executes the SQL script to add the game stats to the database.
        sql_script = get_sql_script("game_stats/add-game-stats.sql")
        cursor.execute(sql_script, (game_id,))

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise


def update_game_stats(game_id: int, net_profit_loss: int, average_profit_loss: int):
    """
    Updates the game stats for the given 'game_id'.

    Args:
        game_id (int): The game_id of the game whose stats are to be updated.
        net_profit_loss (int): The net profit/loss to be updated.
        average_profit_loss (int): The average profit/loss to be updated.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> update_game_stats(1, 600, 100)
    """
    # Attempts to get and execute the SQL script to update the game stats for the given 'game_id'.
    try:
        # Gets and executes the SQL script to update the game stats for the given 'game_id'.
        sql_script = get_sql_script("game_stats/update-game-stats.sql")
        cursor.execute(sql_script, (net_profit_loss,
                       average_profit_loss, game_id))

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise


def get_game_stats(game_id: int) -> Dict:
    """
    Gets the game stats for the given 'game_id'.

    Args:
        game_id (int): The username to be validated.

    Returns:
        Dict[str, int]: A dictionary containing the following keys:
            - "number_of_hands" (int): The number of hands played in this game.
            - "net_profit_loss" (int): The net profit/loss of the player in this game.
            - "average_profit_loss" (int): The average profit/loss per hand of the player in this game.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> get_game_stats(1)
        {
            "number_of_hands": 5,
            "net_profit_loss": 220,
            "average_profit_loss": 44
        }
    """
    # Attempts to get and execute the SQL script to get the game stats from the database.
    try:
        # Gets and executes the SQL script to get the game stats from the database.
        sql_script = get_sql_script("game_stats/get-game-stats.sql")
        cursor.execute(sql_script, (game_id,))

        # Gets and stores the game information in a dictionary.
        stats = cursor.fetchone()
        game_stats = {
            "number_of_hands": stats[0],
            "net_profit_loss": stats[1],
            "average_profit_loss": stats[2],
        }

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns the game stats.
    return game_stats


# =========================
# 'wallets' table functions
# =========================
def update_wallet(wallet: int, username: str):
    """
    Gets and executes the SQL script to update a wallet for the given username.

    Args:
        wallet (int): The new wallet value to be updated in the database.
        username (str): The username of the account associated with the given wallet.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> update_wallet("username")
    """
    # Attempts to get and execute the SQL script to update the wallet for the given username in the database.
    try:
        # Gets and executes the SQL script to update the wallet for the given username in the database.
        sql_script = get_sql_script("wallets/update-wallet.sql")
        cursor.execute(sql_script, (wallet, username))

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise


def get_wallet(user_id: str) -> int:
    """
    Gets and executes the SQL script to get the wallet value for the given user_id.

    Args:
        user_id (str): The user_id of the account for which the wallet value is to be retrieved.

    Returns:
        int: An integer representing the value of the wallet for the given account.

    Raises:
        psycopg2.Error: An error occurred when connecting to the database, 
                        executing SQL commands or committing changes to the database.
        Exception: An unexpected error occurred.

    Example:
        >>> get_wallet("user_id")
        100
    """
    # Attempts to get and execute the SQL script to get the wallet for the given user_id in the database.
    try:
        # Gets and executes the SQL script to get the wallet for the given user_id in the database.
        sql_script = get_sql_script("wallets/get-wallet.sql")
        cursor.execute(sql_script, (user_id,))

        # Stores the wallet for the given user_id in a variable.
        wallet = cursor.fetchone()[0]

        # Commits the changes to the database.
        connection.commit()

    # Catches any errors connecting to the database, executing SQL or committing
    # changes to the database.
    except psycopg2.Error as e:
        print("An error occurred connecting to the database, executing SQL or committing changes to the databse: ", e)
        raise

    # Catches any other errors.
    except Exception as e:
        print("An error occurred: ", e)
        raise

    # Returns the wallet value for the given user_id.
    return wallet
