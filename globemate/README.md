# GlobeMate Collector

אפליקציית Python לאיסוף מידע מקומות מ-Google Places API

## תיאור
אפליקציה אינטראקטיבית שמאפשרת לחפש מקומות בעולם, לראות אותם על המפה ולאסוף מידע מפורט עליהם.

## תכונות
- 🗺️ מפת Google Maps אינטראקטיבית
- 🔍 חיפוש מקומות עם השלמה אוטומטית
- 📍 הצגת מקומות על המפה
- 📊 איסוף מידע מפורט: שם, כתובת, דירוג, ביקורות, שעות פתיחה
- 💾 ייצוא הנתונים ל-JSON

## הגדרה

### 1. מפתחות API נדרשים
צריך להגדיר ב-Replit Secrets:
- `GOOGLE_PLACES_KEY` - מפתח שרת ל-Places API
- `BROWSER_KEY` - מפתח דפדפן ל-Maps JavaScript API

### 2. התקנת תלות
```bash
pip install fastapi uvicorn requests jinja2 python-multipart
```

### 3. הפעלה
```bash
cd globemate
PYTHONPATH=/home/runner/workspace/.pythonlibs/lib/python3.11/site-packages python3 server.py
```

השרת יעלה על: http://localhost:8000

## API Endpoints
- `GET /` - דף הבית עם המפה
- `GET /health` - בדיקת סטטוס השרת
- `GET /api/place-details?place_id=PLACE_ID` - קבלת פרטים מפורטים על מקום

## שימוש
1. פתח את האפליקציה בדפדפן
2. השתמש בשדה החיפוש למציאת מקומות
3. לחץ על המקומות כדי לראות אותם על המפה
4. לחץ "ייצוא JSON" להורדת כל הנתונים שנאספו

## מבנה הפרויקט
```
globemate/
├── server.py          # שרת FastAPI ראשי
├── requirements.txt   # תלות Python
├── templates/
│   └── index.html    # דף האפליקציה
├── static/           # קבצים סטטיים
└── README.md         # המדריך הזה
```