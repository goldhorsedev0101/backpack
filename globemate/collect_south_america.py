#!/usr/bin/env python3
import os
import sys
import json
import time
import requests
from datetime import datetime

# Add dependencies path
sys.path.insert(0, '/home/runner/workspace/.pythonlibs/lib/python3.11/site-packages')

from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Configuration
GOOGLE_PLACES_KEY = os.getenv("GOOGLE_PLACES_KEY")
if not GOOGLE_PLACES_KEY:
    print("Error: GOOGLE_PLACES_KEY not found in environment")
    sys.exit(1)

# Database setup
DB_URL = "sqlite:///globemate.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
Base = declarative_base()

class Place(Base):
    __tablename__ = "places"
    place_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    address = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    rating = Column(Float)
    reviews_count = Column(Integer)
    website = Column(String)
    phone = Column(String)
    types = Column(Text)  # JSON
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    reviews = relationship("Review", back_populates="place", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True)
    place_id = Column(String, ForeignKey("places.place_id"), index=True)
    source = Column(String)
    rating = Column(Float)
    text = Column(Text)
    lang = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    author = Column(String, nullable=True)
    url = Column(String, nullable=True)
    
    place = relationship("Place", back_populates="reviews")

# Create tables
Base.metadata.create_all(engine)

# Search queries for South America
SOUTH_AMERICA_QUERIES = [
    # Peru
    "hostels cusco peru",
    "backpacker hostels lima peru", 
    "budget hostels arequipa peru",
    "hostels huacachina peru",
    "hostels iquitos peru",
    
    # Colombia
    "hostels bogota colombia",
    "backpacker hostels medellin colombia",
    "hostels cartagena colombia",
    "hostels santa marta colombia",
    "hostels cali colombia",
    
    # Ecuador
    "hostels quito ecuador",
    "hostels guayaquil ecuador",
    "hostels banos ecuador",
    "hostels cuenca ecuador",
    
    # Bolivia
    "hostels la paz bolivia",
    "hostels sucre bolivia",
    "hostels cochabamba bolivia",
    "hostels uyuni bolivia",
    
    # Chile
    "hostels santiago chile",
    "hostels valparaiso chile",
    "hostels atacama chile",
    "hostels patagonia chile",
    
    # Argentina
    "hostels buenos aires argentina",
    "hostels mendoza argentina",
    "hostels bariloche argentina",
    "hostels salta argentina",
    
    # Brazil
    "hostels rio de janeiro brazil",
    "hostels sao paulo brazil",
    "hostels salvador brazil",
    "hostels florianopolis brazil",
    
    # Uruguay
    "hostels montevideo uruguay",
    "hostels punta del este uruguay",
    
    # Paraguay
    "hostels asuncion paraguay",
    
    # Activities & Attractions
    "tours machu picchu peru",
    "amazon tours colombia",
    "patagonia tours chile argentina",
    "galapagos tours ecuador",
    "wine tours mendoza argentina",
    "coffee tours colombia"
]

def google_text_search(text_query, limit=20):
    """Search Google Places using text query"""
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types",
        "Content-Type": "application/json"
    }
    body = {"textQuery": text_query}
    
    try:
        r = requests.post(url, headers=headers, json=body, timeout=15)
        r.raise_for_status()
        return r.json().get("places", [])
    except requests.RequestException as e:
        print(f"Search error for '{text_query}': {e}")
        return []

def get_place_details(place_id):
    """Get detailed information for a place"""
    url = f"https://places.googleapis.com/v1/places/{place_id}"
    headers = {
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,internationalPhoneNumber,rating,userRatingCount,websiteUri,location,currentOpeningHours,editorialSummary,reviews"
    }
    
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        print(f"Details error for {place_id}: {e}")
        return None

def save_to_database(place_data):
    """Save place data to database"""
    session = SessionLocal()
    try:
        place_id = place_data.get("place_id")
        if not place_id:
            return False
            
        # Check if place exists
        existing_place = session.get(Place, place_id)
        if existing_place:
            print(f"Place {place_id} already exists, skipping")
            return False
            
        # Create new place
        place = Place(
            place_id=place_id,
            name=place_data.get("name"),
            address=place_data.get("address"),
            lat=place_data.get("lat"),
            lng=place_data.get("lng"),
            rating=place_data.get("rating"),
            reviews_count=place_data.get("reviews_count"),
            website=place_data.get("website"),
            phone=place_data.get("phone"),
            types=json.dumps(place_data.get("types", [])),
            summary=place_data.get("summary"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(place)
        
        # Add reviews
        for review_data in place_data.get("reviews", []):
            review_id = review_data.get("id")
            if not review_id:
                continue
                
            review = Review(
                id=review_id,
                place_id=place_id,
                source="google",
                rating=review_data.get("rating"),
                text=review_data.get("text"),
                published_at=datetime.utcnow(),  # Simplified for now
                author=review_data.get("author")
            )
            session.add(review)
        
        session.commit()
        print(f"✓ Saved: {place_data.get('name')} ({place_id})")
        return True
        
    except Exception as e:
        session.rollback()
        print(f"✗ Database error: {e}")
        return False
    finally:
        session.close()

def main():
    print("🗺️  Starting South America data collection...")
    print(f"📊 Will collect data for {len(SOUTH_AMERICA_QUERIES)} queries")
    
    total_found = 0
    total_saved = 0
    
    for i, query in enumerate(SOUTH_AMERICA_QUERIES, 1):
        print(f"\n[{i}/{len(SOUTH_AMERICA_QUERIES)}] Searching: {query}")
        
        # Search places
        places = google_text_search(query, limit=10)
        if not places:
            print("  No results found")
            continue
            
        print(f"  Found {len(places)} places")
        total_found += len(places)
        
        # Process each place
        for place in places:
            place_id = place.get("id")
            if not place_id:
                continue
                
            # Get detailed information
            details = get_place_details(place_id)
            if not details:
                continue
                
            # Normalize data
            place_data = {
                "place_id": place_id,
                "name": (details.get("displayName") or {}).get("text"),
                "address": details.get("formattedAddress"),
                "lat": (details.get("location") or {}).get("latitude"),
                "lng": (details.get("location") or {}).get("longitude"),
                "rating": details.get("rating"),
                "reviews_count": details.get("userRatingCount"),
                "website": details.get("websiteUri"),
                "phone": details.get("internationalPhoneNumber"),
                "types": [place.get("types") or []],
                "summary": (details.get("editorialSummary") or {}).get("text"),
                "reviews": [
                    {
                        "id": f"google:{place_id}:{idx}",
                        "rating": review.get("rating"),
                        "text": (review.get("text") or {}).get("text"),
                        "author": (review.get("authorAttribution") or {}).get("displayName")
                    } for idx, review in enumerate(details.get("reviews", []))
                ]
            }
            
            # Save to database
            if save_to_database(place_data):
                total_saved += 1
            
            # Rate limiting
            time.sleep(0.5)
        
        # Pause between queries
        time.sleep(1)
    
    print(f"\n🎉 Collection complete!")
    print(f"📈 Total found: {total_found}")
    print(f"💾 Total saved: {total_saved}")
    print(f"🗄️  Database: {DB_URL}")

if __name__ == "__main__":
    main()