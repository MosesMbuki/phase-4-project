from models import Review, db, User, Speaker
from flask import Blueprint, jsonify, request

Reviews = Blueprint("reviews", __name__)

# Create a new review
@Reviews.route("/reviews", methods=["POST"])
def create_review():
    data = request.get_json()
    
    user_id = data.get("user_id")
    speaker_id = data.get("speaker_id")
    rating = data.get("rating")
    comment = data.get("comment")

    if not user_id or not speaker_id or not rating:
        return jsonify({"error": "User ID, Speaker ID, and Rating are required"}), 400

    user = User.query.get(user_id)
    speaker = Speaker.query.get(speaker_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not speaker:
        return jsonify({"error": "Speaker not found"}), 404

    new_review = Review(user_id=user_id, speaker_id=speaker_id, rating=rating, comment=comment)
    
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"message": "Review created successfully"}), 201

# fetch all reviews for a speaker
@Reviews.route("/reviews/speaker/<int:speaker_id>", methods=["GET"])
def fetch_reviews_by_speaker(speaker_id):
    speaker = Speaker.query.get(speaker_id)

    if not speaker:
        return jsonify({"error": "Speaker not found"}), 404

    reviews = Review.query.filter_by(speaker_id=speaker_id).all()
    
    review_list = []
    for review in reviews:
        review_data = {
            "id": review.id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        }
        review_list.append(review_data)

    return jsonify(review_list), 200

# Fetch all reviews by a user
@Reviews.route("/reviews/user/<int:user_id>", methods=["GET"])
def fetch_reviews_by_user(user_id):
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
@Reviews.route("/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"error": "Review not found"}), 404

    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Review deleted successfully"}), 200

# Update a review
@Reviews.route("/reviews/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    data = request.get_json()
    
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"error": "Review not found"}), 404

    rating = data.get("rating")
    comment = data.get("comment")

    if rating is not None:
        review.rating = rating
    if comment is not None:
        review.comment = comment

    db.session.commit()

    return jsonify({"message": "Review updated successfully"}), 200
