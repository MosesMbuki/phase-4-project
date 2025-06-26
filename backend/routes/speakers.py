from flask import Blueprint, request, jsonify
from models import Speaker, Manufacturer, Category, Review, User
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

speakers_bp = Blueprint('speakers', __name__)

# Create a new speaker
@speakers_bp.route('/speakers', methods=['POST'])
@jwt_required()
def create_speaker():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Verify user is admin
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['model_name', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Missing required fields: {required_fields}'}), 400
    
    try:
        # Handle manufacturer (accept either ID or name)
        manufacturer = None
        if 'manufacturer_id' in data:
            manufacturer = Manufacturer.query.get(data['manufacturer_id'])
        elif 'manufacturer_name' in data:
            manufacturer = Manufacturer.query.filter_by(name=data['manufacturer_name']).first()
            if not manufacturer:
                manufacturer = Manufacturer(
                    name=data['manufacturer_name'],
                    logo_url=data.get('manufacturer_logo_url')
                )
                db.session.add(manufacturer)
        else:
            return jsonify({'error': 'Either manufacturer_id or manufacturer_name required'}), 400
        
        # Handle category (accept either ID or name)
        category = None
        if 'category_id' in data:
            category = Category.query.get(data['category_id'])
        elif 'category_name' in data:
            category = Category.query.filter_by(name=data['category_name']).first()
            if not category:
                category = Category(
                    name=data['category_name'],
                    description=data.get('category_description')
                )
                db.session.add(category)
        else:
            return jsonify({'error': 'Either category_id or category_name required'}), 400
        
        # Commit manufacturer and category first to get IDs
        db.session.commit()
        
        # Create new speaker
        new_speaker = Speaker(
            model_name=data['model_name'],
            manufacturer_id=manufacturer.id,
            category_id=category.id,
            price=data['price'],
            specs=data.get('specs', {
                'description': '',
                'features': [],
                'dimensions': '',
                'weight': ''
            }),
            image_url=data.get('image_url', 'https://via.placeholder.com/300'),
            added_by=current_user_id,
            avg_rating=0.0
        )
        
        db.session.add(new_speaker)
        db.session.commit()
        
        # Prepare response
        speaker_data = {
            'id': new_speaker.id,
            'model_name': new_speaker.model_name,
            'manufacturer': {
                'id': manufacturer.id,
                'name': manufacturer.name,
                'logo_url': manufacturer.logo_url
            },
            'category': {
                'id': category.id,
                'name': category.name,
                'description': category.description
            },
            'price': float(new_speaker.price),
            'specs': new_speaker.specs,
            'image_url': new_speaker.image_url,
            'avg_rating': float(new_speaker.avg_rating),
            'reviews': []
        }
        
        return jsonify({
            'message': 'Speaker created successfully',
            'speaker': speaker_data
        }), 201
    
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating speaker: {str(e)}")
        return jsonify({
            'error': 'Failed to create speaker',
            'details': str(e)
        }), 500
    
    return jsonify({'message': 'Speaker created successfully', 'id': speaker.id}), 201

@speakers_bp.route('/speakers', methods=['GET'])
def get_speakers():
    # Get all speakers with average rating
    speakers = db.session.query(
        Speaker,
        func.coalesce(func.avg(Review.rating), 0).label('avg_rating')
    ).outerjoin(Review).group_by(Speaker.id).all()
    
    result = []
    for speaker, avg_rating in speakers:
        speaker_data = {
            'id': speaker.id,
            'model_name': speaker.model_name,
            'manufacturer': speaker.manufacturer.name,
            'category': speaker.category.name,
            'price': float(speaker.price) if speaker.price else None,
            'avg_rating': round(float(avg_rating), 1),
            'image_url': speaker.image_url,
            'short_description': speaker.specs.get('short_description', '')[:100] if speaker.specs else ''
        }
        result.append(speaker_data)
    
    return jsonify(result), 200

@speakers_bp.route('/speakers/<int:id>', methods=['GET'])
def get_speaker(id):
    speaker = Speaker.query.get_or_404(id)
    
    # Calculate average rating
    avg_rating = db.session.query(
        func.coalesce(func.avg(Review.rating), 0)
    ).filter(Review.speaker_id == id).scalar()
    
    # Get approved reviews with user info
    reviews = db.session.query(
        Review,
        User.username,
        User.profile_pic
    ).join(User).filter(
        Review.speaker_id == id,
        Review.is_approved == True
    ).all()
    
    # Get related speakers (same manufacturer)
    related = Speaker.query.filter(
        Speaker.manufacturer_id == speaker.manufacturer_id,
        Speaker.id != speaker.id
    ).limit(4).all()
    
    speaker_data = {
        'id': speaker.id,
        'model_name': speaker.model_name,
        'manufacturer': {
            'name': speaker.manufacturer.name,
            'logo_url': speaker.manufacturer.logo_url
        },
        'category': speaker.category.name,
        'price': float(speaker.price) if speaker.price else None,
        'specs': speaker.specs or {},
        'image_url': speaker.image_url,
        'avg_rating': round(float(avg_rating), 1),
        'reviews': [{
            'id': review.id,
            'username': username,
            'user_avatar': profile_pic,
            'rating': review.rating,
            'comment': review.comment,
            'date': review.post_date.isoformat()
        } for review, username, profile_pic in reviews],
        'related_speakers': [{
            'id': s.id,
            'model_name': s.model_name,
            'image_url': s.image_url,
            'price': float(s.price) if s.price else None
        } for s in related]
    }
    
    return jsonify(speaker_data), 200

@speakers_bp.route('/speakers/<int:id>/reviews', methods=['POST'])
@jwt_required()
def add_review(id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'rating' not in data or 'comment' not in data:
        return jsonify({'error': 'Rating and comment are required'}), 400
    
    if data['rating'] < 1 or data['rating'] > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    review = Review(
        user_id=current_user_id,
        speaker_id=id,
        rating=data['rating'],
        comment=data['comment']
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify({'message': 'Review added successfully'}), 201

# edit speaker by admin
@speakers_bp.route('/speakers/<int:id>', methods=['PUT'])
@jwt_required()
def update_speaker(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403
    
    speaker = Speaker.query.get_or_404(id)
    data = request.get_json()
    
    try:
        # Update manufacturer if changed
        if 'manufacturer_name' in data:
            manufacturer = Manufacturer.query.filter_by(name=data['manufacturer_name']).first()
            if not manufacturer:
                manufacturer = Manufacturer(
                    name=data['manufacturer_name'],
                    logo_url=data.get('manufacturer_logo_url', '')
                )
                db.session.add(manufacturer)
            speaker.manufacturer = manufacturer
        
        # Update category if changed
        if 'category_name' in data:
            category = Category.query.filter_by(name=data['category_name']).first()
            if not category:
                category = Category(
                    name=data['category_name'],
                    description=data.get('category_description', '')
                )
                db.session.add(category)
            speaker.category = category
        
        # Update other fields
        if 'model_name' in data:
            speaker.model_name = data['model_name']
        if 'price' in data:
            speaker.price = data['price']
        if 'image_url' in data:
            speaker.image_url = data['image_url']
        if 'specs' in data:
            speaker.specs = {**speaker.specs, **data['specs']}
        
        db.session.commit()
        
        return jsonify({
            'message': 'Speaker updated successfully',
            'speaker': {
                'id': speaker.id,
                'model_name': speaker.model_name,
                'manufacturer': speaker.manufacturer.name,
                'category': speaker.category.name,
                'price': float(speaker.price),
                'image_url': speaker.image_url,
                'specs': speaker.specs
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update speaker',
            'details': str(e)
        }), 500
    
