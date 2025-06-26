from models import User, Speaker, Review, Request
from app import db
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

requests_bp = Blueprint('requests', __name__)

# create new request
@requests_bp.route('/requests/create_request', methods=['POST'])
@jwt_required()
def create_request():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data is required'}), 400
            
        if not all(key in data for key in ['speaker_name', 'reason']):
            return jsonify({'error': 'speaker_name and reason are required'}), 400
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        new_request = Request(
            user_id=user_id,
            speaker_name=data['speaker_name'],
            manufacturer=data.get('manufacturer'),
            reason=data['reason'],
            status='pending'
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Request created successfully', 
            'request_id': new_request.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create request',
            'details': str(e)
        }), 500

# Fetch requests for current user
@requests_bp.route('/requests/user', methods=['GET'])
@jwt_required()
def fetch_requests_by_user():
    user_id = get_jwt_identity()
    requests = Request.query.filter_by(user_id=user_id).all()
    
    request_list = [{
        'id': req.id,
        'user_id': req.user_id,  # Make sure this is included
        'speaker_name': req.speaker_name,
        'manufacturer': req.manufacturer,
        'reason': req.reason,
        'status': req.status,
        'request_date': req.request_date.isoformat() if req.request_date else None
    } for req in requests]
    
    return jsonify(request_list), 200
# Fetch all requests (for admin)
@requests_bp.route('/requests', methods=['GET'])
@jwt_required()
def fetch_all_requests():
    current_user = User.query.get(get_jwt_identity())
    
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    requests = Request.query.all()
    request_list = []
    
    for req in requests:
        request_data = {
            'id': req.id,
            'user_id': req.user_id,
            'speaker_name': req.speaker_name,
            'manufacturer': req.manufacturer,
            'reason': req.reason,
            'status': req.status,
            'request_date': req.request_date.isoformat() if req.request_date else None
        }
        request_list.append(request_data)
    
    return jsonify(request_list), 200

# update requests
@requests_bp.route('/requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_request(request_id):
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    
    if not user:
        return jsonify({'error': 'Access denied'}), 403
    
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    data = request.get_json()
    
    if 'reason' in data:
        req.reason = data['reason']
    
    db.session.commit()
    
    return jsonify({'message': 'Request updated successfully', 'id': req.id}), 200

# Allow request owner to update their request
@requests_bp.route('/requests/user/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_user_request(request_id):
    current_user_id = get_jwt_identity()
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    if req.user_id != current_user_id:
        return jsonify({'error': 'You can only edit your own requests'}), 403
    
    data = request.get_json()
    
    if 'speaker_name' in data:
        req.speaker_name = data['speaker_name']
    if 'manufacturer' in data:
        req.manufacturer = data['manufacturer']
    if 'reason' in data:
        req.reason = data['reason']
    
    db.session.commit()
    
    return jsonify({'message': 'Request updated successfully', 'id': req.id}), 200

# Allow request owner to delete their request
@requests_bp.route('/requests/user/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_user_request(request_id):
    current_user_id = get_jwt_identity()
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    if req.user_id != current_user_id:
        return jsonify({'error': 'You can only delete your own requests'}), 403
    
    db.session.delete(req)
    db.session.commit()
    
    return jsonify({'message': 'Request deleted successfully'}), 200

# approve or reject request by admin
@requests_bp.route('/requests/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_request_status(request_id):
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    
    if not user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    data = request.get_json()
    
    if 'status' not in data or data['status'] not in ['approved','pending', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    
    req.status = data['status']
    
    db.session.commit()
    
    return jsonify({'message': 'Request status updated successfully', 'id': req.id}), 200
