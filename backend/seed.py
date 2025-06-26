from app import app, db, mail
from models import User, Manufacturer, Category, Speaker, Review, Request
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random
import json

def create_sample_data():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Create admin user
        admin = User(
            username='admin',
            email='admin@audioalchemy.com',
            password=generate_password_hash('admin123'),
            is_admin=True,
            profile_pic='https://example.com/admin.jpg'
        )
        db.session.add(admin)

        # Create regular users
        users = []
        for i in range(1, 6):
            user = User(
                username=f'user{i}',
                email=f'user{i}@example.com',
                password=generate_password_hash(f'user{i}pass'),
                profile_pic=f'https://example.com/user{i}.jpg'
            )
            users.append(user)
            db.session.add(user)

        # Create manufacturers
        manufacturers = [
            Manufacturer(name='Bose', country='USA', website='https://www.bose.com', logo_url='https://example.com/bose.jpg'),
            Manufacturer(name='Sony', country='Japan', website='https://www.sony.com', logo_url='https://example.com/sony.jpg'),
            Manufacturer(name='JBL', country='USA', website='https://www.jbl.com', logo_url='https://example.com/jbl.jpg'),
            Manufacturer(name='Sennheiser', country='Germany', website='https://www.sennheiser.com', logo_url='https://example.com/sennheiser.jpg'),
            Manufacturer(name='Audio-Technica', country='Japan', website='https://www.audio-technica.com', logo_url='https://example.com/audio-technica.jpg')
        ]
        for m in manufacturers:
            db.session.add(m)

        # Create categories
        categories = [
            Category(name='Bookshelf', description='Compact speakers for small spaces'),
            Category(name='Floor-standing', description='Large speakers for home theaters'),
            Category(name='Portable', description='Wireless and battery-powered speakers'),
            Category(name='Studio Monitors', description='Professional audio equipment'),
            Category(name='Soundbars', description='TV audio enhancement')
        ]
        for c in categories:
            db.session.add(c)

        db.session.commit()

        # Create speakers
        speakers = []
        specs = {
            "description": "High-quality audio with deep bass",
            "features": ["Bluetooth", "Wireless", "Voice Assistant"],
            "short_description": "Premium sound experience"
        }
        
        for i in range(1, 21):
            speaker = Speaker(
                model_name=f'Model {i}',
                manufacturer_id=random.choice(manufacturers).id,
                category_id=random.choice(categories).id,
                price=random.uniform(50, 2000),
                specs=specs,
                image_url=f'https://example.com/speaker{i}.jpg',
                added_by=random.choice(users).id,
                date_added=datetime.utcnow() - timedelta(days=random.randint(1, 365))
            )
            speakers.append(speaker)
            db.session.add(speaker)

        db.session.commit()

        # Create reviews
        for speaker in speakers:
            for i in range(random.randint(0, 10)):
                review = Review(
                    user_id=random.choice(users).id,
                    speaker_id=speaker.id,
                    rating=random.randint(1, 5),
                    comment=f'This is a sample review for {speaker.model_name}',
                    post_date=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    is_approved=True
                )
                db.session.add(review)

        # Create requests
        for i in range(1, 6):
            request = Request(
                user_id=random.choice(users).id,
                speaker_name=f'Requested Speaker {i}',
                manufacturer=f'Manufacturer {i}',
                reason=f'Reason for request {i}',
                status=random.choice(['pending', 'approved', 'rejected']),
                request_date=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.session.add(request)

        db.session.commit()

        print("Database seeded successfully!")

if __name__ == '__main__':
    create_sample_data()