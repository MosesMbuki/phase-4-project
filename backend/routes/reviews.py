from models import Review, db, User, Speaker
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

reviews_bp = Blueprint("reviews", __name__)

# Create a new review
@reviews_bp.route("/reviews/create_review", methods=["POST"])
@jwt_required()
def create_review():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request data is required"}), 400

        speaker_id = data.get("speaker_id")
        rating = data.get("rating")
        comment = data.get("comment")

        if not all([speaker_id, rating, comment]):
            return jsonify({"error": "speaker_id, rating, and comment are required"}), 400

        speaker = Speaker.query.get(speaker_id)
        if not speaker:
            return jsonify({"error": "Speaker not found"}), 404
        
        if not User.query.get(current_user_id):
            return jsonify({"error": "User not found"}), 404

        if rating < 1 or rating > 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400
        
        review = Review(
            user_id=current_user_id,
            speaker_id=speaker_id,
            rating=rating,
            comment=comment,
            is_approved=False  # Default to false for moderation
        )
        
        db.session.add(review)
        db.session.commit()

        return jsonify({
            "message": "Review submitted successfully",
            "review_id": review.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "An error occurred while creating the review",
            "details": str(e)
        }), 500

# fetch all reviews
@reviews_bp.route("/reviews", methods=["GET"])
def fetch_all_reviews():
    reviews = Review.query.all()
    
    review_list = []
    for review in reviews:
        review_data = {
            "id": review.id,
            "user_id": review.user_id,
            "speaker_id": review.speaker_id,
            "rating": review.rating,
            "comment": review.comment,
            "post_date": review.post_date
        }
        review_list.append(review_data)

    return jsonify(review_list), 200

# fetch all reviews for a speaker
@reviews_bp.route("/reviews/speaker/<int:speaker_id>", methods=["GET"])
def fetch_reviews_by_speaker(speaker_id):
    speaker = Speaker.query.get(speaker_id)

    if not speaker:
        return jsonify({"error": "Speaker not found"}), 404

    reviews = Review.query.filter_by(speaker_id=speaker_id).all()
    
    review_list = []
    for review in reviews:
        review_data = {
            "rating": review.rating,
            "comment": review.comment,
            "post_date": review.post_date
        }
        review_list.append(review_data)

    return jsonify(review_list), 200

# Fetch all reviews by a user
@reviews_bp.route("/reviews/user/<int:user_id>", methods=["GET"])
@jwt_required()
def fetch_reviews_by_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"error": "You can only view your own reviews"}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    reviews = Review.query.filter_by(user_id=user_id).all()
    review_list = []
    for review in reviews:
        review_data = {
            "id": review.id,
            "speaker_id": review.speaker_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        }
        review_list.append(review_data)
    return jsonify(review_list), 200


# Delete a review
@reviews_bp.route("/reviews/<int:review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):
    current_user_id = get_jwt_identity()
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    if review.user_id != current_user_id:
        return jsonify({"error": "You can only delete your own reviews"}), 403
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted successfully"}), 200


# Update a review
@reviews_bp.route("/reviews/<int:review_id>", methods=["PUT"])
@jwt_required()
def update_review(review_id):
    current_user_id = get_jwt_identity()
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({"error": "Review not found"}), 404
    
    if review.user_id != current_user_id:
        return jsonify({"error": "You can only update your own reviews"}), 403

    data = request.get_json()
    rating = data.get("rating")
    comment = data.get("comment")

    if rating is not None:
        review.rating = rating
    if comment is not None:
        review.comment = comment

    db.session.commit()

    return jsonify({"message": "Review updated successfully"}), 200

