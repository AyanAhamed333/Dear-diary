import sqlite3
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import os

app = Flask(__name__)
DB_FILE = 'diary.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            mood INTEGER NOT NULL,
            content TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save_entry', methods=['POST'])
def save_entry():
    data = request.get_json()
    date_str = data.get('date')
    mood = data.get('mood')
    content = data.get('content')
    
    if not date_str or not mood or not content:
        return jsonify({'error': 'Missing data'}), 400
        
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO entries (date, mood, content)
            VALUES (?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
            mood = excluded.mood,
            content = excluded.content
        ''', (date_str, mood, content))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/get_entry/<date>', methods=['GET'])
def get_entry(date):
    conn = get_db_connection()
    entry = conn.execute('SELECT * FROM entries WHERE date = ?', (date,)).fetchone()
    conn.close()
    
    if entry:
        return jsonify({
            'date': entry['date'],
            'mood': entry['mood'],
            'content': entry['content']
        })
    return jsonify({'error': 'Not found'}), 404

@app.route('/get_month_entries/<year>/<month>', methods=['GET'])
def get_month_entries(year, month):
    conn = get_db_connection()
    month_str = str(month).zfill(2)
    pattern = f"{year}-{month_str}-%"
    entries = conn.execute('SELECT date, mood FROM entries WHERE date LIKE ?', (pattern,)).fetchall()
    conn.close()
    
    result = {entry['date']: entry['mood'] for entry in entries}
    return jsonify(result)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
