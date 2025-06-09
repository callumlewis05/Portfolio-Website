from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from .db import *
from .sort import sort_rows
import datetime
import math

# Renders all the routes in a blueprint.
blackjack_views = Blueprint("blackjack_views", __name__, url_prefix='projects/blackjack')


# =================
# General functions
# =================
@blackjack_views.before_request
def remove_game_id():
    """
    This function is called before each request. 
    It checks if the player has left the game by checking if the current endpoint is different from the 
    one stored in the session variable 'table'. The session variable 'table' is the most recently visited
    table and if they are different, it removes the 'game_id' from the session.
    """
    try:
        # Removes the game_id from the session if the user has left the game.
        if request.endpoint != session["table"]:
            session.pop('game_id', None)
    except KeyError:
        # Ignore the error if 'table' is not set in the session
        pass


# ==============
# Menu functions
# ==============
@blackjack_views.route('/')
def home():
    """
    Renders the appropriate home page template based on the user's login status.
    Checks if a 'username' key exists in the session to determine login status.

    Returns:
        Rendered HTML template:
            - 'home/user-home.html': If the user is logged in (username in session).
            - 'home/home.html': If the user is not logged in (guest).

    Example:
        - User logged in (username in session):
            This will render the 'home/user-home.html' template.

        - User not logged in (no username in session):
            This will render the 'home/home.html' template (for guests).
    """

    if 'username' in session:
        # User is logged in, render user menu template
        return render_template('home/user-home.html')
    else:
        # User is not logged in (guest), render guest menu template
        return render_template('home/guest-home.html')


@blackjack_views.route('/menu')
def menu():
    """
    Renders the appropriate menu page template based on the user's login status.
    Checks if a 'username' key exists in the session to determine login status.

    Returns:
        Rendered HTML template:
            - 'menu/user-menu.html': If the user is logged in (username in session).
            - 'menu/guest-menu.html': If the user is not logged in (guest).

    Example:
        - User logged in (username in session):
            This will render the 'menu/user-menu.html' template.

        - User not logged in (no username in session):
            This will render the 'menu/guest-menu.html' template.
    """

    if 'username' in session:
        # User is logged in, render user menu template
        return render_template('menu/user-menu.html')
    else:
        # User is not logged in (guest), render guest menu template
        return render_template('menu/guest-menu.html')


# ====================
# Menu items functions
# ====================
@blackjack_views.route('/menu/rules')
def rules():
    """
    Renders the game rules page template.

    Returns:
        Rendered HTML template: 'menu/rules.html'
    """

    # Render the rules HTML template.
    return render_template('menu/rules.html')


@blackjack_views.route('/menu/tables')
def tables():
    """
    Renders the game tables page template.

    Checks for an 'error_message' key in the session and displays it as a flash message if present.
    The 'error_message' is then removed from the session to prevent it from being displayed again
    on subsequent requests.

    Returns:
        Rendered HTML template: 'menu/tables.html'
    """

    # Gets and removes the error_message from the session.
    error_message = session.pop('error_message', None)

    # Display the error message if it exists.
    if error_message:
        flash(error_message, category='error,insufficient-funds')

    # Render the tables HTML template.
    return render_template('menu/tables.html')


@blackjack_views.route('/menu/tutorials')
def tutorials():
    """
    Renders the tutorials page template.

    Returns:
        Rendered HTML template: 'menu/tutorials.html'
    """

    return render_template('menu/tutorials.html')


@blackjack_views.route('/menu/account')
def account():
    """
    Renders the game rules page template.

    Returns:
        Rendered HTML template: 'menu/rules.html'
        A redirect to the menu if the user is not logged in.
    """
    # Checks if the user is logged in.
    if 'username' in session:
        info = get_account_information(session['username'])
        # If the user is logged in (authenticated), render the user menu template
        return render_template('menu/account.html',
                               username=session['username'],
                               wallet=info["wallet"],
                               sign_up_date=info["sign_up_date"],)
    else:
        # If the user is not logged in (guest), redirect the user to the guest menu.
        return redirect(url_for('views.menu'))


@blackjack_views.route('/menu/game-history', methods=['GET', 'POST'])
def game_history():
    """
    Displays the users game history including features of each game such as the 
    number of hands played and net profit. Allows the user to tab between pages and 
    sort by different columns.

    Returns:
        Rendered HTML template: 'menu/game-history.html'
    """
    # Checks if the user is logged in.
    if 'username' in session:
        # Gets all the games from the database.
        games = get_all_games(session['user_id'])

        # Defines the parameters to be passesed into the sort function for each sort type.
        sorted_games = {
            "ascending_date": (games, 0),
            "descending_date": (games, 0, True),
            "ascending_time": (games, 1),
            "descending_time": (games, 1, True),
            "ascending_num_of_hands": (games, 2),
            "descending_num_of_hands": (games, 2, True),
            "ascending_net_profit_loss": (games, 3),
            "descending_net_profit_loss": (games, 3, True),
            "ascending_average_profit_loss": (games, 4),
            "descending_average_profit_loss": (games, 4, True),
            "ascending_game_stakes": (games, 5),
            "descending_game_stakes": (games, 5, True)
        }

        # Getting the values for page_num and sort_type.
        page_num = session.get('page_num', 1)
        sort_type = session.get('sort_type', 'ascending_date')

        # Handling POST request to update page_num and sort_type.
        if request.method == 'POST':
            sort_type = request.form.get('sort_type', sort_type)
            change_page = request.form.get('page_num', page_num)

            if change_page == '+':
                page_num += 1
            elif change_page == '-':
                page_num -= 1

        # Calculate the maximum page number based on the length of games.
        max_page_num = max(1, math.ceil(len(games) / 7))

        # Ensure page_num doesn't go below 1.
        page_num = max(page_num, 1)

        # Ensure page_num doesn't exceed the maximum page number.
        page_num = min(page_num, max_page_num)

        # Sorts the games with the parameters from the sort type.
        sorted_rows = sort_rows(*sorted_games[sort_type])

        # Formats the date and time into day, month, year and hours, minutes, respectively.
        for game in sorted_rows:
            if isinstance(game[0], datetime.date) and isinstance(game[1], datetime.time):
                game[0] = game[0].strftime("%d-%m-%Y")
                game[1] = game[1].strftime("%H:%M")

        # Update session with the new values.
        session['page_num'] = page_num
        session['sort_type'] = sort_type

        # Renders the HTML template.
        return render_template('menu/game-history.html', games=sorted_rows, page_num=page_num)
    else:
        # If the user is not logged in (guest), render the guest menu template
        return redirect(url_for('views.menu'))


# ================
# Tables functions
# ================
def table(table_stakes: str, practice: bool = False):
    """
    Renders the game table view.

    Args:
        table_stakes (str): The stakes of the table, can be 'low', 'medium', or 'high'.

    Returns:
        Rendered HTML template: 'board.html'

    Raises:
        KeyError: If `table_stakes` is not one of 'low', 'medium', or 'high'.
        Redirect: If the user is not logged in or does not have enough funds in their wallet.
    """
    # Checks if the user is logged in.
    if 'username' in session:
        if practice == False:
            # Sets the minimum bet based on the `table_stakes`.
            min_bet = {
                'low': 1,
                'medium': 20,
                'high': 100
            }[table_stakes]

            # Adds the endpoint to the session so that it can be accessed by the `remove_game_id` function.
            session['table'] = f"views.{table_stakes}_stakes_table"

            # Checks if the user has enough funds in their wallet.
            if get_wallet(session['user_id']) < min_bet:
                # If the user does not have enough funds, it redirects them to the tables menu and displays an error message.
                error_message = "You do not have enough funds in your wallet."
                session['error_message'] = error_message
                return redirect(url_for('views.tables'))
            # Checks if data is being sent in the request.
            elif request.method == 'POST':
                # Gets the data sent in the request.
                user_id = session['user_id']
                username = request.form.get('username')
                wallet = request.form.get('wallet')
                profit_loss = request.form.get('profit_loss')

                # Checks if the data being sent is from an ongoing game or a new game.
                if 'game_id' not in session:
                    # If it's a new game, it creates a new game in the database and stores
                    # the  `game_id` in the session.
                    game_id = create_game(user_id, table_stakes.capitalize())
                    session['game_id'] = game_id
                    add_game_stats(game_id)

                # Gets the current game stats from the database.
                game_stats = get_game_stats(session['game_id'])

                # Calculates the new game stats using the POST request data.
                net_profit_loss = game_stats["net_profit_loss"] + \
                    int(profit_loss)
                average_profit_loss = net_profit_loss // (
                    game_stats["number_of_hands"] + 1)

                # Updates the game stats in the databse using the new game stats.
                update_game_stats(session['game_id'],
                                  net_profit_loss, average_profit_loss)

                # Updates the users wallet with the new value.
                update_wallet(wallet, session['user_id'])

    # Gets the player username and wallet to pass into the HTML template.
    player_wallet = get_account_information(session['username'])[
        'wallet'] if ('username' in session and practice == False) else 100
    player_username = session['username'] if (
        'username' in session) else "Guest"

    # Renders the HTML template using the username, wallet and table_stakes.
    return render_template('board.html',
                           page="tables",
                           table_stakes=table_stakes,
                           player_username=player_username,
                           player_wallet=player_wallet)


@blackjack_views.route('/menu/tables/low-stakes-table', methods=['GET', 'POST'])
def low_stakes_table():
    """
    Renders the board page template with low stakes.

    Returns:
        Rendered HTML template: 'board.html'
    """

    return table('low')


@blackjack_views.route('/menu/tables/medium-stakes-table', methods=['GET', 'POST'])
def medium_stakes_table():
    """
    Renders the board page template with low stakes.

    Returns:
        Rendered HTML template: 'board.html'
    """

    return table('medium')


@blackjack_views.route('/menu/tables/high-stakes-table', methods=['GET', 'POST'])
def high_stakes_table():
    """
    Renders the board page template with low stakes.

    Returns:
        Rendered HTML template: 'board.html'
    """

    return table('high')


@blackjack_views.route('/menu/tables/practice-table')
def practice_table():
    """
    Renders the board page template with low stakes.

    Returns:
        Rendered HTML template: 'board.html'
    """

    return table('low', True)


@blackjack_views.route('/menu/tutorials/<tutorial_type>')
def basics(tutorial_type):
    """
    Renders the board page template as a tutorial.

    Args:
        tutorial (str): Tells the HTML template what type of tutorial to display.

    Returns:
        Rendered HTML template: 'board.html'
    """
    return render_template('board.html', page="tutorials", tutorial_type=tutorial_type)
