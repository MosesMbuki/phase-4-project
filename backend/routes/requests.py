from models import User, Speaker, Review, Request
from app import db
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

requests_bp = Blueprint('requests', __name__)

# create new request
@requests_bp.route('/requests/create_request', methods=['POST'])
@jwt_required()
def create_request():
    data = request.get_json()
    if not data or 'speaker_name' not in data or 'reason' not in data:
        return jsonify({'error': 'speaker_name and reason are required'}), 400
    
    speaker_name = data['speaker_name']
    manufacturer = data.get('manufacturer', None)
    reason = data['reason']

    speaker = Speaker.query.get(speaker_name)
    if not speaker:
        return jsonify({'error': 'Speaker not found'}), 404
    
    user_id = get_jwt_identity()
    new_request = Request(user_id=user_id, speaker_name=speaker_name, manufacturer=manufacturer, reason=reason)
    
    default_status = 'Pending'
    new_request.status = default_status
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({'message': 'Request created successfully', 'id': new_request.id}), 201

# fetch all requests by user
@requests_bp.route('/requests/user', methods=['GET'])
@jwt_required()
def fetch_requests_by_user():
    user_id = get_jwt_identity()
    requests = Request.query.filter_by(user_id=user_id).all()
    
    if not requests:
        return jsonify({'message': 'No requests found for this user'}), 404
    
    request_list = []
    for req in requests:
        request_data = {
            'id': req.id,
            'speaker_name': req.speaker_name,
            'manufacturer': req.manufacturer,
            'reason': req.reason,
            'request_date': req.request_date
        }
        request_list.append(request_data)
    
    return jsonify(request_list), 200

# fetch all requests only for admin
@requests_bp.route('/requests', methods=['GET'])
@jwt_required()
def fetch_all_requests():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
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
            'request_date': req.request_date
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

# delete request
@requests_bp.route('/requests/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_request(request_id):
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    db.session.delete(req)
    db.session.commit()
    
    return jsonify({'message': 'Request deleted successfully'}), 200

# approve or reject request by admin
@requests_bp.route('/requests/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_request_status(request_id):
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    
    if not user or not user.is_admin:
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
