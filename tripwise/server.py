from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    """עמוד ראשי"""
    return render_template('index.html')

@app.route('/api/status')
def api_status():
    """API endpoint לבדיקת סטטוס השרת"""
    return jsonify({
        'status': 'active',
        'message': 'TripWise Python Server is running'
    })

if __name__ == '__main__':
    # הפעלת השרת בפורט 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)