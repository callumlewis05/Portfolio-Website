# Define routes and handle user requests
from flask import Blueprint, render_template, request, flash, url_for, redirect, session
from .db import add_user, get_account_information, validate_password, validate_username

# Renders all the routes in a blueprint.
auth = Blueprint("auth", __name__)


# =================
# General functions
# =================
@auth.before_request
def remove_game_id():
    """
    This function is called before each request. 
    It checks if the player has left the game by checking if the current endpoint is different from the 
    one stored in the session variable 'table'. The session varaiable 'table' is the most recently visited
    table and if they are different, it removes the 'game_id' from the session.
    """
    try:
        # Removes the game_id from the session if the user has left the game.
        if request.endpoint != session["table"]:
            session.pop('game_id', None)
    except KeyError:
        # Ignore the error if 'table' is not set in the session.
        pass


# ===============
# Login functions
# ===============
@auth.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handles login requests. Based on the request method (GET or POST) this function
    either displays the login form or processes a login attempt.

    Returns:
        A rendered HTML login page.
    """
    # Checks if the request is sending data.
    if request.method == 'POST':
        # Get username and password from the login form.
        username = request.form.get('username')
        password = request.form.get('password')

        # Check if username exists.
        user_exists = validate_username(username)

        # Checks if the user exists and flashes an error if they do not.
        if user_exists is False:
            flash('User does not exist', category='error,login')
        elif user_exists is True:
            # Since the username exists, check if the password is correct.
            password_correct = validate_password(username, password)
            if password_correct is True:
                # If the password is correct, get user information and store it in session.
                user = get_account_information(username)
                flash('Login successful!', category='success,login')
                session['username'] = username
                session['user_id'] = user["user_id"]
            elif password_correct is False:
                # If the password is incorrect, flash an error message.
                flash('Incorrect password', category='error,login')

    # Regardless of GET or POST, return the login form template.
    return render_template('projects/blackjack/auth/login.html')


@auth.route('/logout')
def logout():
    """
    Logs out the current user by removing the username from the session.

    Returns:
        A redirect to the home page.
    """
    # Checks if the user is logged in, and if so, removes the username from the session, logging them out.
    if 'username' in session:
        session.pop('username', None)
        session.pop('user_id', None)

    # Redirects the user to the home page.
    return redirect(url_for('blackjack_views.home'))


# =================
# Sign-up functions
# =================
@auth.route('/sign-up', methods=['GET', 'POST'])
def signup():
    """
    Handles signup requests. Based on the request method (GET or POST) this function
    either displays the signup form or processes a signup attempt.

    Returns:
        Returns a redirect to the home page.
    """
    # Checks if the request is sending data.
    if request.method == 'POST':
        # Gets the 'POST' request data.
        username = request.form.get('username')
        password1 = request.form.get('password1')
        password2 = request.form.get('password2')

        # Validate password length.
        if len(password1) < 8:
            flash('Passwords must have a minimum of 8 characters', category='error,signup')
        # Validate passwords match.
        elif password1 != password2:
            flash('Passwords do not match', category='error,signup')
        else:
            # Attempt to add the user with the provided information.
            registered = add_user(username, password1)
            if registered:
                # User registration successful, flash success message and store user info in session.
                flash('Account created!', category="success,signup")
                user_information = get_account_information(username)
                session['username'] = username
                session['user_id'] = user_information['user_id']
            else:
                # Username already exists, flash error message.
                flash('Username already exists.', category='error,signup')

    # Renders the HTML template.
    return render_template('projects/blackjack/auth/sign-up.html')
