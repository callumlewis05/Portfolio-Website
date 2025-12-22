from flask import Blueprint, render_template, session, redirect, url_for, request, flash

# Renders all the routes in a blueprint.
views = Blueprint("views", __name__)



# ==============
# Menu functions
# ==============
@views.route('/')
def home():
    """
    Renders the homepage.

    Returns:
        Rendered HTML template: 'index.html'
    """
    vertex_shader_url = url_for('static', filename='shaders/vertexShader.glsl')
    fragment_shader_url = url_for('static', filename='shaders/fragmentShader.glsl')
    return render_template(
        'menu/index.html',
        vertex_shader_url=vertex_shader_url, 
        fragment_shader_url=fragment_shader_url
    )

@views.route('/about')
def about():
    """
    Renders the about currently displaying a message that the page is coming soon.

    Returns:
        Rendered HTML template: 'about.html'
    """
    return render_template('menu/about.html')

@views.route('/projects')
def projects():
    """
    Renders the projects currently displaying a message that the page is coming soon.

    Returns:
        Rendered HTML template: 'projects.html'
    """
    return render_template('menu/projects.html')

@views.route('/experience')
def experience():
    """
    Renders the experience currently displaying a message that the page is coming soon.

    Returns:
        Rendered HTML template: 'experience.html'
    """
    return render_template('menu/experience.html')

@views.route('/contact')
def contact():
    """
    Renders the contact currently displaying a message that the page is coming soon.

    Returns:
        Rendered HTML template: 'contact.html'
    """
    return render_template('menu/contact.html')

@views.route('/projects/ivp')
def ivp():
    return render_template('projects/ivp/ivp.html')
