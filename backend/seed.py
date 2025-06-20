import random
from datetime import datetime, timedelta
from app import db, app
from models import User, Manufacturer, Category, Speaker, Review, Request, TokenBlocklist

def seed_database():
    with app.app_context():
        print("🗑️ Clearing existing data...")
        # Clear all data (in reverse order of dependencies)
        TokenBlocklist.query.delete()
        Request.query.delete()
        Review.query.delete()
        Speaker.query.delete()
        Category.query.delete()
        Manufacturer.query.delete()
        User.query.delete()
        db.session.commit()

        print("🌱 Seeding users...")
        # Create admin user
        admin = User(
            username="admin",
            email="admin@audioalchemy.com",
            password="admin",
            is_admin=True,
            join_date=datetime.utcnow()
        )
        
        # Create regular users
        users = [
            User(
                username=f"user{i}",
                email=f"user{i}@example.com",
                password=f"user_{i}",
                join_date=datetime.utcnow() - timedelta(days=random.randint(1, 365))
            ) for i in range(1, 6)
        ]
        users.append(admin)
        db.session.add_all(users)
        db.session.commit()

        print("🏭 Seeding manufacturers...")
        manufacturers = [
            Manufacturer(
                name="Bose",
                country="USA",
                website="https://www.bose.com",
                logo_url="https://logo.clearbit.com/bose.com"
            ),
            Manufacturer(
                name="Sony",
                country="Japan",
                website="https://www.sony.com",
                logo_url="https://logo.clearbit.com/sony.com"
            ),
            Manufacturer(
                name="Sennheiser",
                country="Germany",
                website="https://www.sennheiser.com",
                logo_url="https://logo.clearbit.com/sennheiser.com"
            )
        ]
        db.session.add_all(manufacturers)
        db.session.commit()

        print("📦 Seeding categories...")
        categories = [
            Category(name="Bookshelf", description="Compact speakers for small spaces"),
            Category(name="Floorstanding", description="Large speakers for home theaters"),
            Category(name="Portable", description="Wireless and battery-powered speakers"),
            Category(name="Studio Monitors", description="Professional audio equipment")
        ]
        db.session.add_all(categories)
        db.session.commit()

        print("🔊 Seeding speakers...")
        speakers = []
        for i in range(1, 11):
            speakers.append(
                Speaker(
                    model_name=f"Model {i}00",
                    manufacturer_id=random.choice([m.id for m in manufacturers]),
                    category_id=random.choice([c.id for c in categories]),
                    price=random.uniform(99.99, 1999.99),
                    specs={
                        "power": f"{random.randint(20, 500)}W",
                        "frequency_response": f"{random.randint(40, 20000)}Hz",
                        "impedance": f"{random.choice([4, 6, 8])}Ω"
                    },
                    image_url=f"https://picsum.photos/400/300?random={i}",
                    added_by=random.choice([u.id for u in users]),
                    date_added=datetime.utcnow() - timedelta(days=random.randint(1, 180))
                )
            )
        db.session.add_all(speakers)
        db.session.commit()

        print("⭐ Seeding reviews...")
        reviews = []
        for speaker in speakers:
            for i in range(random.randint(1, 5)):
                reviews.append(
                    Review(
                        user_id=random.choice([u.id for u in users]),
                        speaker_id=speaker.id,
                        rating=random.randint(1, 5),
                        comment_text=f"This speaker is {'amazing' if random.random() > 0.3 else 'ok'}!",
                        post_date=datetime.utcnow() - timedelta(days=random.randint(1, 90)),
                        is_approved=random.random() > 0.2  # 80% approved
                    )
                )
        db.session.add_all(reviews)
        db.session.commit()

        print("📝 Seeding requests...")
        requests = []
        for i in range(5):
            requests.append(
                Request(
                    user_id=random.choice([u.id for u in users if not u.is_admin]),
                    speaker_name=f"Requested Model {i}",
                    manufacturer=f"Potential Manufacturer {i}",
                    reason=f"We need this because {random.choice(['clients are asking', 'market is missing', 'innovation'])}",
                    status=random.choice(['pending', 'approved', 'rejected']),
                    request_date=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
            )
        db.session.add_all(requests)
        db.session.commit()

        print("✅ Database seeded successfully!")

if __name__ == '__main__':
    seed_database()