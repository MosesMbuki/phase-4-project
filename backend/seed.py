from app import app, db, mail
from models import User, Manufacturer, Category, Speaker, Review, Request, TokenBlocklist
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random
import json

def create_sample_data():
    with app.app_context():
        print("Dropping and recreating all tables...")
        db.drop_all()
        db.create_all()

        # Create admin user
        admin = User(
            username='admin',
            email='admin@audioalchemy.com',
            password=generate_password_hash('Admin@1234'),
            is_admin=True,
            profile_pic='https://xsgames.co/randomusers/avatar.php?g=male'
        )
        db.session.add(admin)

        # Create regular users
        users = []
        first_names = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Riley']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones']
        
        for i in range(1, 6):
            user = User(
                username=f'{first_names[i-1]}_{last_names[i-1]}',
                email=f'{first_names[i-1].lower()}.{last_names[i-1].lower()}@example.com',
                password=generate_password_hash(f'User{i}@1234'),
                profile_pic=f'https://xsgames.co/randomusers/avatar.php?g={random.choice(["male","female"])}'
            )
            users.append(user)
            db.session.add(user)

        # Create manufacturers including Edifier
        manufacturers = [
            Manufacturer(
                name='Bose', 
                country='USA', 
                website='https://www.bose.com',
                logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Bose_logo.svg/1200px-Bose_logo.svg.png'
            ),
            Manufacturer(
                name='Sony', 
                country='Japan', 
                website='https://www.sony.com',
                logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sony_logo.svg/1200px-Sony_logo.svg.png'
            ),
            Manufacturer(
                name='Edifier',
                country='China',
                website='https://www.edifier.com',
                logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Edifier_logo.svg/1200px-Edifier_logo.svg.png'
            ),
            Manufacturer(
                name='Sennheiser', 
                country='Germany', 
                website='https://www.sennheiser.com',
                logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Sennheiser_logo_2017.svg/2560px-Sennheiser_logo_2017.svg.png'
            ),
            Manufacturer(
                name='JBL', 
                country='USA', 
                website='https://www.jbl.com',
                logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/JBL_logo.svg/2560px-JBL_logo.svg.png'
            ),
            Manufacturer(
                name='Klipsch', 
                country='USA', 
                website='https://www.klipsch.com',
                logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Klipsch_logo.svg/1200px-Klipsch_logo.svg.png'
            )
        ]
        db.session.add_all(manufacturers)

        # Create categories
        categories = [
            Category(
                name='Bookshelf Speakers',
                description='Compact speakers designed to fit on shelves or stands'
            ),
            Category(
                name='Floorstanding Speakers',
                description='Tall, freestanding speakers for powerful audio'
            ),
            Category(
                name='Studio Monitors',
                description='Professional-grade speakers for accurate audio reproduction'
            ),
            Category(
                name='Portable Bluetooth',
                description='Wireless speakers for music on the go'
            ),
            Category(
                name='Soundbars',
                description='Space-saving speakers for TV audio enhancement'
            )
        ]
        db.session.add_all(categories)
        db.session.commit()

        # Create speakers - only one Edifier S880DB MKII and add the new models
        speaker_models = [
            # Bose
            {
                'model_name': 'Bose 901',
                'manufacturer': 'Bose',
                'category': 'Bookshelf Speakers',
                'price': 3999.99,
                'image_url': 'https://i.postimg.cc/Zqrbv3F1/cq5dam-web-1000-1000.png',
                'specs': {
                    'description': 'Legendary speaker system with active equalization',
                    'features': ['9 drivers', 'Active equalizer', 'Floorstanding design'],
                    'dimensions': '25.5 x 14.5 x 12.5 inches',
                    'weight': '45 lbs'
                }
            },
            # Sony
            {
                'model_name': 'Sony SS-CS3',
                'manufacturer': 'Sony',
                'category': 'Portable Bluetooth',
                'price': 199.99,
                'image_url': 'https://i.postimg.cc/d0FnwPWG/e4d2fecc751a2423a3ee0b81764d6081.avif',
                'specs': {
                    'description': '3-way, 3-driver bookshelf speaker system',
                    'features': ['Super tweeter', 'Mica-reinforced woofer'],
                    'dimensions': '13.13 x 7.88 x 9.13 inches',
                    'weight': '12.1 lbs'
                }
            },
            {
                'model_name': 'Edifier S880DB MKII',
                'manufacturer': 'Edifier',
                'category': 'Bookshelf Speakers',
                'price': 300.0,
                'image_url': 'https://i.postimg.cc/fRGhMLXk/8f14c4fbc4275d90c276383a4c767b60.png',
                'specs': {
                    'description': 'Premium bookshelf speakers with excellent sound',
                    'features': ['Bluetooth 5.0', 'Optical input', 'Remote control'],
                    'dimensions': '9.5 x 6.2 x 7.8 inches',
                    'weight': '15.4 lbs'
                }
            },
            {
                'model_name': 'Edifier MR5',
                'manufacturer': 'Edifier',
                'category': 'Studio Monitors',
                'price': 700.0,
                'image_url': 'https://i.postimg.cc/XvNNRX0F/818939479695b6932aa69d1bc169f6ce.webp',
                'specs': {
                    'description': 'Professional studio monitors for accurate mixing',
                    'features': ['5-inch woofer', '1-inch tweeter', 'XLR/TRS inputs'],
                    'dimensions': '11.4 x 8.3 x 9.8 inches',
                    'weight': '22 lbs'
                }
            },
                {
        'model_name': 'Klipsch Bookshelf Speakers',
        'manufacturer': 'Klipsch',
        'category': 'Bookshelf Speakers',
        'price': 2499.99,
        'image_url': 'https://m.media-amazon.com/images/I/81XFmaAxroL._AC_SL1500_.jpg',
        'specs': {
            'description': 'Premium bookshelf speakers with horn-loaded tweeters',
            'features': ['1" titanium tweeter', '5.25" spun-copper woofer', 'Bass reflex design'],
            'dimensions': '14.5 x 7.5 x 10.2 inches',
            'weight': '15.4 lbs',
            'short_description': 'High-performance bookshelf speakers'
        }
    },
    {
        'model_name': 'Klipsch Floorstanding Speakers',
        'manufacturer': 'Klipsch',
        'category': 'Floorstanding Speakers',
        'price': 899.99,
        'image_url': 'https://m.media-amazon.com/images/I/61eeSyKKIOL._AC_SL1200_.jpg',
        'specs': {
            'description': 'Powerful floorstanding speakers with signature horn technology',
            'features': ['1" titanium tweeter', 'Dual 6.5" woofers', '90x90 Tractrix horn'],
            'dimensions': '39.5 x 8.5 x 14.5 inches',
            'weight': '44.8 lbs',
            'short_description': 'Dynamic floorstanding speakers'
        }
    },
    {
        'model_name': 'Klipsch Tuneable Speaker',
        'manufacturer': 'Klipsch',
        'category': 'Bookshelf Speakers',
        'price': 1799.99,
        'image_url': 'https://m.media-amazon.com/images/I/81fiFUlAjCL._AC_SL1500_.jpg',
        'specs': {
            'description': 'Versatile speakers with adjustable sound profile',
            'features': ['Customizable EQ', '1" titanium tweeter', '6.5" cerametallic woofer'],
            'dimensions': '15.75 x 9.5 x 12.5 inches',
            'weight': '28.7 lbs',
            'short_description': 'Adjustable high-fidelity speakers'
        }
    }
        ]

        speakers = []
        for model in speaker_models:
            manufacturer = Manufacturer.query.filter_by(name=model['manufacturer']).first()
            category = Category.query.filter_by(name=model['category']).first()
            
            speaker = Speaker(
                model_name=model['model_name'],
                manufacturer_id=manufacturer.id,
                category_id=category.id,
                price=model['price'],
                specs=model['specs'],
                image_url=model['image_url'],
                added_by=random.choice(users).id,
                date_added=datetime.utcnow() - timedelta(days=random.randint(1, 365)))
            speakers.append(speaker)
            db.session.add(speaker)
        
        db.session.commit()

        # Create reviews
        review_comments = [
            "The sound quality is exceptional, especially for the price.",
            "Great bass response and clear highs. Very satisfied!",
            "These exceeded my expectations. Perfect for my home theater.",
            "Good overall sound, but the mids could be more pronounced.",
            "Excellent build quality and beautiful design.",
            "Not as powerful as I expected, but decent for the price."
        ]

        for speaker in speakers:
            for _ in range(random.randint(3, 10)):
                review = Review(
                    user_id=random.choice(users).id,
                    speaker_id=speaker.id,
                    rating=random.randint(3, 5),
                    comment=random.choice(review_comments),
                    post_date=datetime.utcnow() - timedelta(days=random.randint(1, 180)),
                    is_approved=random.choice([True, True, True, False])
                )
                db.session.add(review)

        # Create requests
        request_reasons = [
            "Looking for a high-end speaker with Dolby Atmos support",
            "Need a recommendation for a small apartment setup",
            "Requesting a speaker with exceptional bass response",
            "Looking for professional studio monitors under $1000",
            "Need a durable outdoor speaker for patio use"
        ]

        for i in range(5):
            request = Request(
                user_id=random.choice(users).id,
                speaker_name=f'Custom Request {i+1}',
                manufacturer=random.choice(['Bose', 'Sony', 'Edifier', 'Sennheiser']),
                reason=request_reasons[i],
                status=random.choice(['pending', 'approved', 'rejected']),
                request_date=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.session.add(request)

        db.session.commit()
        print("Successfully seeded data!")

if __name__ == '__main__':
    create_sample_data()