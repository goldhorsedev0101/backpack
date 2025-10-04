import os
import json
import requests
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request, Body, Query
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from sqlalchemy import (
    create_engine, Column, String, Float, Integer, DateTime, Text, ForeignKey, Boolean
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# ==== Secrets ====
GOOGLE_PLACES_KEY = os.getenv("GOOGLE_PLACES_KEY")   # Places API (SERVER)
BROWSER_KEY = os.getenv("BROWSER_KEY")               # Maps JS (BROWSER)
FB_PAGE_TOKEN = os.getenv("FB_PAGE_TOKEN")           # Graph API token (optional)

if not GOOGLE_PLACES_KEY:
    raise RuntimeError("חסר GOOGLE_PLACES_KEY ב-Secrets")
if not BROWSER_KEY:
    raise RuntimeError("חסר BROWSER_KEY ב-Secrets")

# ==== FastAPI ====
app = FastAPI(title="GlobeMate Collector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # צמצם לדומיין שלך אם תרצה
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static & Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ==== DB (SQLite מקומי ב-Replit) ====
DB_URL = os.getenv("DATABASE_URL", "sqlite:///globemate.db")
engine = create_engine(
    DB_URL, connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {}
)
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
    types = Column(Text)            # JSON (list)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="place", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True)  # source_review_id or generated
    place_id = Column(String, ForeignKey("places.place_id"), index=True)
    source = Column(String)                # google/yelp/ta
    rating = Column(Float)
    text = Column(Text)
    lang = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    author = Column(String, nullable=True)
    url = Column(String, nullable=True)

    place = relationship("Place", back_populates="reviews")

class SocialPost(Base):
    __tablename__ = "social_posts"
    id = Column(String, primary_key=True)  # facebook post id
    platform = Column(String, default="facebook")
    place_id = Column(String, ForeignKey("places.place_id"), nullable=True)
    text = Column(Text)
    created_at = Column(DateTime)
    url = Column(String)
    raw = Column(Text)  # JSON dump of original

Base.metadata.create_all(engine)

# ==== Pages ====
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "browser_key": BROWSER_KEY})

@app.get("/health")
def health():
    return {"ok": True}

# ==== Google Places (Server) ====
FIELDS = ",".join([
    "id",
    "displayName",
    "formattedAddress",
    "internationalPhoneNumber",
    "rating",
    "userRatingCount",
    "websiteUri",
    "location",
    "currentOpeningHours",
    "editorialSummary",
    "reviews"
])

@app.get("/api/place-details")
def place_details(place_id: str):
    url = f"https://places.googleapis.com/v1/places/{place_id}"
    headers = {"X-Goog-Api-Key": GOOGLE_PLACES_KEY, "X-Goog-FieldMask": FIELDS}
    r = requests.get(url, headers=headers, timeout=15)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    p = r.json()
    out = {
        "place_id": place_id,
        "name": (p.get("displayName") or {}).get("text"),
        "address": p.get("formattedAddress"),
        "phone": p.get("internationalPhoneNumber"),
        "rating": p.get("rating"),
        "reviews_count": p.get("userRatingCount"),
        "website": p.get("websiteUri"),
        "lat": (p.get("location") or {}).get("latitude"),
        "lng": (p.get("location") or {}).get("longitude"),
        "opening_hours": (p.get("currentOpeningHours") or {}).get("weekdayDescriptions"),
        "summary": (p.get("editorialSummary") or {}).get("text"),
        "reviews": [
            {
                "id": f"google:{place_id}:{i}",
                "source": "google",
                "rating": rv.get("rating"),
                "text": (rv.get("text") or {}).get("text"),
                "published_at": rv.get("publishTime"),
                "author": (rv.get("authorAttribution") or {}).get("displayName")
            } for i, rv in enumerate(p.get("reviews", []))
        ]
    }
    return JSONResponse(out)

# ==== Save collected places to DB ====
@app.post("/api/save-places")
def save_places(payload: List[dict] = Body(...)):
    """
    קולט מערך של מקומות (כפי שה-frontend מייצא/מאחד),
    ושומר לטבלאות places + reviews (אם קיימות בבקשה).
    """
    if not isinstance(payload, list):
        raise HTTPException(400, "Payload must be a JSON array")

    ses = SessionLocal()
    saved = 0
    try:
        for item in payload:
            place_id = item.get("place_id")
            if not place_id:
                continue

            place = ses.get(Place, place_id)
            if not place:
                place = Place(place_id=place_id, created_at=datetime.utcnow())
                ses.add(place)

            # עדכון שדות
            if item.get("name"):
                place.name = item.get("name")
            if item.get("address"):
                place.address = item.get("address")
            if item.get("lat") is not None:
                place.lat = item.get("lat")
            if item.get("lng") is not None:
                place.lng = item.get("lng")
            if item.get("rating") is not None:
                place.rating = item.get("rating")
            if item.get("reviews_count"):
                place.reviews_count = item.get("reviews_count")
            if item.get("website"):
                place.website = item.get("website")
            if item.get("phone"):
                place.phone = item.get("phone")
            # types יכול להגיע כ-list או כ-string JSON
            types_val = item.get("types")
            if isinstance(types_val, list):
                place.types = json.dumps(types_val, ensure_ascii=False)
            elif isinstance(types_val, str):
                place.types = types_val
            if item.get("summary"):
                place.summary = item.get("summary")
            place.updated_at = datetime.utcnow()

            # שמירת ביקורות אם צורפו בבקשה
            for rv in item.get("reviews", []) or []:
                rid = rv.get("id")
                if not rid:
                    continue
                if ses.get(Review, rid):
                    continue
                ses.add(Review(
                    id=rid,
                    place_id=place_id,
                    source=rv.get("source") or "google",
                    rating=rv.get("rating"),
                    text=rv.get("text"),
                    lang=rv.get("lang"),
                    published_at=_maybe_datetime(rv.get("published_at")),
                    author=rv.get("author"),
                    url=rv.get("url"),
                ))
            saved += 1

        ses.commit()
    except Exception as e:
        ses.rollback()
        raise HTTPException(500, f"DB error: {e}")
    finally:
        ses.close()
    return {"saved_places": saved}

def _maybe_datetime(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None

# ==== Query places (basic filters) ====
@app.get("/api/places")
def list_places(
    q: Optional[str] = Query(None, description="חיפוש בשם/כתובת"),
    min_rating: Optional[float] = Query(None),
    limit: int = 50,
    offset: int = 0,
):
    ses = SessionLocal()
    try:
        qry = ses.query(Place)
        if q:
            like = f"%{q}%"
            qry = qry.filter((Place.name.ilike(like)) | (Place.address.ilike(like)))
        if min_rating is not None:
            qry = qry.filter(Place.rating >= min_rating)
        total = qry.count()
        rows = qry.order_by(Place.updated_at.desc()).offset(offset).limit(limit).all()
        out = []
        for p in rows:
            out.append({
                "place_id": p.place_id,
                "name": p.name,
                "address": p.address,
                "lat": p.lat,
                "lng": p.lng,
                "rating": p.rating,
                "reviews_count": p.reviews_count,
                "website": p.website,
                "phone": p.phone,
                "types": json.loads(p.types) if p.types and isinstance(p.types, str) else [],
                "summary": p.summary,
                "updated_at": p.updated_at.isoformat() if p.updated_at and hasattr(p.updated_at, 'isoformat') else None
            })
        return {"total": total, "items": out}
    finally:
        ses.close()

# ==== Google Text Search Collector ====
SEARCH_FIELDS = "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types"

def _google_text_search(text_query: str, location_bias: dict | None = None, max_results: int = 20):
    """
    קריאת places:searchText — מחזירה רשימת מקומות בסיסית.
    location_bias: dict כמו {"circle": {"center": {"latitude": ..., "longitude": ...}, "radius": 5000}}
    """
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": SEARCH_FIELDS,
        "Content-Type": "application/json"
    }
    body = {"textQuery": text_query}
    if location_bias:
        body["locationBias"] = location_bias
    # אפשר גם body["maxResultCount"] = min(max_results, 20)  # מגבלת API
    r = requests.post(url, headers=headers, json=body, timeout=20)
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)
    return r.json().get("places", [])

@app.get("/api/collect/google")
def collect_google(
    q: str,
    lat: float | None = None,
    lng: float | None = None,
    radius_m: int = 5000,
    limit: int = 20
):
    """
    מפעיל חיפוש Places לפי טקסט (q), מושך פרטים+ביקורות לכל תוצאה, ושומר ל-DB.
    דוגמאות:
    /api/collect/google?q=hostel%20cusco
    /api/collect/google?q=best%20coffee%20medellin&lat=6.2476&lng=-75.5658&radius_m=8000
    """
    loc_bias = None
    if lat is not None and lng is not None:
        loc_bias = {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": radius_m}}

    # 1) חיפוש טקסטואלי
    places = _google_text_search(q, loc_bias, limit)
    if not places:
        return {"found": 0, "saved": 0}

    ses = SessionLocal()
    saved = 0
    details_payload = []

    try:
        for p in places[:limit]:
            pid = p.get("id")
            if not pid:
                continue

            # 2) פרטים מלאים + ביקורות
            try:
                detail = place_details(pid)  # משתמש בפונקציה הקיימת שמחזירה JSONResponse
                if isinstance(detail, JSONResponse):
                    detail = detail.body
                    if isinstance(detail, (bytes, bytearray)):
                        detail = json.loads(detail.decode("utf-8"))
                    elif isinstance(detail, str):
                        detail = json.loads(detail)
                details_payload.append(detail)
            except Exception:
                # אם נכשל, לפחות נשמור את המידע הבסיסי
                details_payload.append({
                    "place_id": pid,
                    "name": (p.get("displayName") or {}).get("text"),
                    "address": p.get("formattedAddress"),
                    "lat": (p.get("location") or {}).get("latitude"),
                    "lng": (p.get("location") or {}).get("longitude"),
                    "rating": p.get("rating"),
                    "reviews_count": p.get("userRatingCount"),
                    "types": [t for t in (p.get("types") or [])],
                    "reviews": []
                })

        # 3) שמירה ל-DB בעזרת אותו מסלול של /api/save-places
        #    (אפשר לשחזר את הלוגיקה פה כדי לא לקרוא HTTP פנימי)
        for item in details_payload:
            place_id = item.get("place_id")
            if not place_id:
                continue

            place = ses.get(Place, place_id)
            if not place:
                place = Place(place_id=place_id, created_at=datetime.utcnow())
                ses.add(place)

            if item.get("name"):
                place.name = item.get("name")
            if item.get("address"):
                place.address = item.get("address")
            if item.get("lat") is not None:
                place.lat = item.get("lat")
            if item.get("lng") is not None:
                place.lng = item.get("lng")
            if item.get("rating") is not None:
                place.rating = item.get("rating")
            if item.get("reviews_count"):
                place.reviews_count = item.get("reviews_count")
            if item.get("website"):
                place.website = item.get("website")
            if item.get("phone"):
                place.phone = item.get("phone")
            types_val = item.get("types")
            if isinstance(types_val, list):
                place.types = json.dumps(types_val, ensure_ascii=False)
            elif isinstance(types_val, str):
                place.types = types_val
            if item.get("summary"):
                place.summary = item.get("summary")
            place.updated_at = datetime.utcnow()

            for rv in item.get("reviews", []) or []:
                rid = rv.get("id")
                if not rid:
                    continue
                if ses.get(Review, rid):
                    continue
                ses.add(Review(
                    id=rid,
                    place_id=place_id,
                    source=rv.get("source") or "google",
                    rating=rv.get("rating"),
                    text=rv.get("text"),
                    lang=rv.get("lang"),
                    published_at=_maybe_datetime(rv.get("published_at")),
                    author=rv.get("author"),
                    url=rv.get("url"),
                ))
            saved += 1

        ses.commit()
    except Exception as e:
        ses.rollback()
        raise HTTPException(500, f"Collector error: {e}")
    finally:
        ses.close()

    return {"query": q, "found": len(places), "saved": saved}

# ==== Facebook Graph API (server-side) ====
@app.get("/api/facebook/posts")
def fb_posts(page_id: str, limit: int = 20):
    """
    דורש FB_PAGE_TOKEN ב-Secrets.
    מושך פוסטים מעמוד ציבורי (לא קבוצות).
    """
    if not FB_PAGE_TOKEN:
        raise HTTPException(400, "FB_PAGE_TOKEN חסר ב-Secrets")

    url = f"https://graph.facebook.com/v19.0/{page_id}/posts"
    params = {
        "access_token": FB_PAGE_TOKEN,
        "limit": limit,
        "fields": "message,created_time,permalink_url,id"
    }
    r = requests.get(url, params=params, timeout=20)
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)

    data = r.json().get("data", [])
    # נשמור גם ב-DB (SocialPost), raw לשחזור
    ses = SessionLocal()
    saved = 0
    try:
        for post in data:
            pid = post.get("id")
            if not pid or ses.get(SocialPost, pid):
                continue
            ses.add(SocialPost(
                id=pid,
                platform="facebook",
                place_id=None,  # אפשר לקשר ידנית/בניתוח NLP בהמשך
                text=post.get("message"),
                created_at=_maybe_datetime(post.get("created_time")),
                url=post.get("permalink_url"),
                raw=json.dumps(post, ensure_ascii=False),
            ))
            saved += 1
        ses.commit()
    except Exception as e:
        ses.rollback()
        raise HTTPException(500, f"DB error: {e}")
    finally:
        ses.close()

    return {"fetched": len(data), "saved_new": saved, "items": data}

# ==== Run dev ====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)