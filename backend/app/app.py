from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, User, Speaker, Review, Request

db = SQLAlchemy()
migrate = Migrate()
app = Flask(__name__)

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)

# Register blueprints
from app.routes.auth import auth_bp
from app.routes.speakers import speakers_bp
from app.routes.reviews import reviews_bp
from app.routes.requests import requests_bp

app.register_blueprint(auth_bp)
app.register_blueprint(speakers_bp)
app.register_blueprint(reviews_bp)
app.register_blueprint(requests_bp)

    