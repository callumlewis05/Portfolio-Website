from flask import Flask
import os
from dotenv import load_dotenv


def create_app():
    """
    Create and configure the Flask application.

    Returns:
        Flask: The configured Flask application.
    """
    # Create the Flask application.
    app = Flask(__name__)

    # Configure the secret key (used to provide cryptographic security).
    load_dotenv()
    app.secret_key = os.getenv('SECRET_KEY')

    # Import all the blueprints.
    from .blackjack_views import blackjack_views
    from .blackjack_auth import auth
    from .views import views

    # Register the blueprints within the Flask application.
    app.register_blueprint(blackjack_views, url_prefix='/projects/blackjack')
    app.register_blueprint(auth, url_prefix='/projects/blackjack')
    app.register_blueprint(views, url_prefix='/')

    # Return the Flask application.
    return app

def create_tables():
    """
    Create database tables.
    """
    from .db import create_tables
    create_tables()
