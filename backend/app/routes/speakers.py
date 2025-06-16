from flask import Blueprint, request, jsonify
from app.models import Speaker, Manufacturer, Category, Review
from app import db

speakers_bp = Blueprint('speakers', __name__)

@speakers_bp.route('/speakers', methods=['POST'])
def create_speaker():
    data = request.get_json()
    
    if not data or 'model_name' not in data or 'manufacturer_id' not in data or 'category_id' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    
    manufacturer = Manufacturer.query.get(data['manufacturer_id'])
    category = Category.query.get(data['category_id'])
    
    if not manufacturer or not category:
        return jsonify({'error': 'Manufacturer or Category not found'}), 404
    
    new_speaker = Speaker(
        model_name=data['model_name'],
        manufacturer=manufacturer,
        category=category,
        price=data.get('price'),
        specs=data.get('specs'),
        image_url=data.get('image_url')
    )
    
    db.session.add(new_speaker)
    db.session.commit()
    
    return jsonify({'message': 'Speaker created successfully', 'id': new_speaker.id}), 201

@speakers_bp.route('/speakers', methods=['GET'])
def get_speakers():
    speakers = Speaker.query.all()
    result = []
    
    for speaker in speakers:
        speaker_data = {
            'id': speaker.id,
            'model_name': speaker.model_name,
            'manufacturer': speaker.manufacturer.name,
            'category': speaker.category.name,
            'price': float(speaker.price) if speaker.price else None,
            'avg_rating': float(speaker.avg_rating),
            'image_url': speaker.image_url
        }
        result.append(speaker_data)
    
    return jsonify(result), 200

@speakers_bp.route('/speakers/<int:id>', methods=['GET'])
def get_speaker(id):
    speaker = Speaker.query.get_or_404(id)
    
    speaker_data = {
        'id': speaker.id,
        'model_name': speaker.model_name,
        'manufacturer': speaker.manufacturer.name,
        'category': speaker.category.name,
        'price': float(speaker.price) if speaker.price else None,
        'specs': speaker.specs,
        'image_url': speaker.image_url,
        'avg_rating': float(speaker.avg_rating),
        'reviews': []
    }
    
    for review in speaker.reviews:
        if review.is_approved:
            speaker_data['reviews'].append({
                'id': review.id,
                'user': review.author.username,
                'rating': review.rating,
                'comment': review.comment_text,
                'date': review.post_date.isoformat()
            })
    
    return jsonify(speaker_data), 200

@speakers_bp.route('/speakers', methods=['POST'])
def add_speaker():
    data = request.get_json()
    
    speaker = Speaker(
        model_name=data['model_name'],
        manufacturer_id=data['manufacturer_id'],
        category_id=data['category_id'],
        price=data.get('price'),
        specs=data.get('specs'),
        image_url=data.get('image_url'),
        # added_by=current_user_id
    )
    
    db.session.add(speaker)
    db.session.commit()
    
    return jsonify({'message': 'Speaker added successfully'}), 201