from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from app import db
from datetime import datetime

metadata = MetaData()
db = SQLAlchemy(metadata=metadata)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_pic = db.Column(db.String(255))
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    reviews = db.relationship('Review', backref='author', lazy=True)
    requests = db.relationship('Request', backref='requester', lazy=True)
    

class Manufacturer(db.Model):
    __tablename__ = 'manufacturers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(50))
    website = db.Column(db.String(255))
    logo_url = db.Column(db.String(255))
    
    speakers = db.relationship('Speaker', backref='manufacturer', lazy=True)

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    speakers = db.relationship('Speaker', backref='category', lazy=True)

class Speaker(db.Model):
    __tablename__ = 'speakers'
    
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), nullable=False)
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturers.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2))
    specs = db.Column(db.JSON)
    image_url = db.Column(db.String(255))
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    avg_rating = db.Column(db.Numeric(3, 2), default=0.00)
    
    reviews = db.relationship('Review', backref='speaker', lazy=True)

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    speaker_id = db.Column(db.Integer, db.ForeignKey('speakers.id'), nullable=False)
    rating = db.Column(db.SmallInteger, nullable=False)
    comment_text = db.Column(db.Text)
    post_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_approved = db.Column(db.Boolean, default=False)

class Request(db.Model):
    __tablename__ = 'requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    speaker_name = db.Column(db.String(100), nullable=False)
    manufacturer = db.Column(db.String(100))
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    request_date = db.Column(db.DateTime, default=datetime.utcnow)