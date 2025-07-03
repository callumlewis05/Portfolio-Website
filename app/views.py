from flask import Blueprint, render_template, session, redirect, url_for, request, flash

# Renders all the routes in a blueprint.
views = Blueprint("views", __name__)



# ==============
# Menu functions
# ==============
@views.route('/')
def home():
    """
    Renders the homepage currently displaying a message that the site is under construction.

    Returns:
        Rendered HTML template: 'home.html'
    """
    return render_template('home/home.html')

@views.route('/projects/ivp')
def ivp():
    return render_template('projects/ivp/ivp.html')
