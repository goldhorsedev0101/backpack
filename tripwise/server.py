from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import uvicorn

app = FastAPI(title="TripWise Python Server", version="1.0.0")

# הגדרת תיקיות סטטיות ותבניות
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """עמוד ראשי"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/status")
async def api_status():
    """API endpoint לבדיקת סטטוס השרת"""
    return {
        'status': 'active',
        'message': 'TripWise FastAPI Server is running',
        'framework': 'FastAPI',
        'version': '1.0.0'
    }

if __name__ == '__main__':
    # הפעלת השרת בפורט 8000
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)