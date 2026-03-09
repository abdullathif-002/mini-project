from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
# Serve frontend from Flask so frontend and backend share the same origin (avoids cross-site cookie issues)
app = Flask(__name__, static_folder=frontend_path, static_url_path='')
app.secret_key = 'change-this-secret'
# Make sessions persistent for a longer period
app.permanent_session_lifetime = timedelta(days=7)
# allow cross-origin requests with cookies/sessions (still useful for API clients)
CORS(app, supports_credentials=True)


@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

DATABASE = 'students.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # create database file if necessary
    # create tables using IF NOT EXISTS to allow migrations
    conn = get_db()
    cursor = conn.cursor()
    # students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            enrollment_date TEXT NOT NULL,
            course TEXT NOT NULL,
            gpa REAL DEFAULT 0.0
        )
    ''')
    # users table (for authentication)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    if not os.path.exists(DATABASE):
        print("Database initialized successfully!")

# Initialize database on startup
init_db()

# authentication helpers

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

# auth routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)',
                       (username, generate_password_hash(password)))
        conn.commit()
        conn.close()
        return jsonify({'message':'User registered'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        if user and check_password_hash(user['password_hash'], password):
            session.permanent = True
            session['user'] = username
            return jsonify({'message':'Logged in'}), 200
        return jsonify({'error':'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message':'Logged out'}), 200

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if 'user' in session:
        return jsonify({'user': session['user']}), 200
    return jsonify({'error':'Unauthorized'}), 401

# GET all students
@app.route('/api/students', methods=['GET'])
@login_required
def get_students():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students ORDER BY id DESC')
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(students), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET single student by ID
@app.route('/api/students/<int:student_id>', methods=['GET'])
@login_required
def get_student(student_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        student = cursor.fetchone()
        conn.close()
        
        if student:
            return jsonify(dict(student)), 200
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# CREATE a new student
@app.route('/api/students', methods=['POST'])
@login_required
def create_student():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'course']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        enrollment_date = datetime.now().strftime('%Y-%m-%d')
        gpa = float(data.get('gpa', 0.0))
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO students (name, email, phone, enrollment_date, course, gpa)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data['name'], data['email'], data['phone'], enrollment_date, data['course'], gpa))
        
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        
        return jsonify({'id': new_id, 'message': 'Student created successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# UPDATE a student
@app.route('/api/students/<int:student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    try:
        data = request.get_json()
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if student exists
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        # Update only provided fields
        update_fields = []
        values = []
        
        for field in ['name', 'email', 'phone', 'course', 'gpa']:
            if field in data:
                update_fields.append(f'{field} = ?')
                if field == 'gpa':
                    values.append(float(data[field]))
                else:
                    values.append(data[field])
        
        if not update_fields:
            conn.close()
            return jsonify({'error': 'No fields to update'}), 400
        
        values.append(student_id)
        query = f"UPDATE students SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(query, values)
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Student updated successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE a student
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if student exists
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# SEARCH students by name or course
@app.route('/api/students/search/<query>', methods=['GET'])
@login_required
def search_students(query):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM students 
            WHERE name LIKE ? OR course LIKE ? OR email LIKE ?
            ORDER BY id DESC
        ''', (f'%{query}%', f'%{query}%', f'%{query}%'))
        
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(students), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'Backend is running'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
