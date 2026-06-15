import os
import sqlite3
import random
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) so the frontend can send requests from file:// or localhost
CORS(app)

# MySQL connection settings from environment or defaults
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'event_management')

USING_SQLITE = False

def get_mysql_connection():
    """Attempts to connect to MySQL database."""
    try:
        # First try to connect without database to create it if it doesn't exist
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        cursor.close()
        conn.close()

        # Connect to the actual database
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return conn
    except Exception as e:
        print(f"[Warning] MySQL connection failed: {e}")
        return None

def init_db():
    """Initializes the database tables (MySQL or SQLite fallback)."""
    global USING_SQLITE
    conn = get_mysql_connection()
    if conn:
        print("Connected to MySQL database successfully.")
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                organization VARCHAR(100),
                event_type VARCHAR(50) NOT NULL,
                ticket_number VARCHAR(20) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(150) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
    else:
        print("Falling back to local SQLite database (event_management.db)...")
        USING_SQLITE = True
        conn = sqlite3.connect('event_management.db')
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                organization TEXT,
                event_type TEXT NOT NULL,
                ticket_number TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

def get_db_connection():
    """Helper to return active DB connection based on state."""
    if USING_SQLITE:
        conn = sqlite3.connect('event_management.db')
        conn.row_factory = sqlite3.Row
        return conn
    else:
        return mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )

def execute_query(query, params=(), commit=False, fetch_all=False, fetch_one=False):
    """Utility function to execute queries safely for both SQLite and MySQL."""
    conn = get_db_connection()
    try:
        if USING_SQLITE:
            cursor = conn.cursor()
            cursor.execute(query.replace('%s', '?'), params)
        else:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
        
        result = None
        if fetch_all:
            if USING_SQLITE:
                result = [dict(row) for row in cursor.fetchall()]
            else:
                result = cursor.fetchall()
        elif fetch_one:
            row = cursor.fetchone()
            if row:
                result = dict(row) if USING_SQLITE else row

        if commit:
            conn.commit()
            
        cursor.close()
        return result
    except Exception as e:
        print(f"Database query error: {e}")
        raise e
    finally:
        conn.close()

# Generate unique ticket code (e.g., TIS-8F3K9A)
def generate_ticket_number():
    while True:
        chars = string.ascii_uppercase + string.digits
        ticket = 'TIS-' + ''.join(random.choices(chars, k=6))
        # Verify uniqueness
        exists = execute_query(
            "SELECT id FROM registrations WHERE ticket_number = %s",
            (ticket,),
            fetch_one=True
        )
        if not exists:
            return ticket

# Initialize database on startup
init_db()

@app.route('/', methods=['GET'])
def home():
    return """
    <html>
        <head>
            <title>TIS 2025 Backend Server</title>
            <style>
                body {
                    font-family: 'Segoe UI', -apple-system, sans-serif;
                    background-color: #07040f;
                    color: #f3f1f6;
                    text-align: center;
                    padding: 8% 2rem;
                    margin: 0;
                    background-image: radial-gradient(circle at 50% 50%, rgba(120, 80, 250, 0.1) 0%, transparent 60%);
                }
                .card {
                    background: rgba(20, 16, 35, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    display: inline-block;
                    padding: 2.5rem;
                    border-radius: 18px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    max-width: 500px;
                }
                h1 {
                    font-size: 1.8rem;
                    margin-bottom: 1rem;
                }
                .accent {
                    background: linear-gradient(135deg, hsl(250, 90%, 65%), hsl(310, 85%, 55%));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                }
                p {
                    color: #a59fb1;
                    line-height: 1.6;
                }
                .endpoints {
                    margin-top: 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 1rem;
                    border-radius: 10px;
                    text-align: left;
                    font-family: monospace;
                    font-size: 0.9rem;
                }
                .endpoints a {
                    color: #d1c7f7;
                    text-decoration: none;
                }
                .endpoints a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>TIS 2025 <span class="accent">Backend Server</span> is Online</h1>
                <p>This is the backend API server. To view your interface pages, open the following files directly in your browser:</p>
                <p>
                    💻 <strong>index.html</strong> (Landing Page)<br>
                    🛠️ <strong>admin.html</strong> (Admin Dashboard)
                </p>
                <div class="endpoints">
                    <strong>Quick Links:</strong><br>
                    • Server Status: <a href="/api/status">/api/status</a><br>
                    • Registrations API: <a href="/api/admin/registrations">/api/admin/registrations</a><br>
                    • Stats API: <a href="/api/admin/stats">/api/admin/stats</a>
                </div>
            </div>
        </body>
    </html>
    """

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "database": "MySQL" if not USING_SQLITE else "SQLite (Fallback)",
        "message": "Backend server is running successfully."
    })

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No credentials provided"}), 400
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        # Secure default credentials for admin portal access
        if username == 'admin' and password == 'TIS2025admin':
            return jsonify({
                "success": True,
                "message": "Login successful",
                "token": "mock-admin-session-token"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Invalid username or password"
            }), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 1. EVENT REGISTRATION ENDPOINT
@app.route('/api/register', methods=['POST'])
def register_event():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        organization = data.get('organization', '').strip()
        event_type = data.get('event', '').strip()
        
        # Simple Validation
        if not name or not email or not phone or not event_type:
            return jsonify({"error": "Missing required fields"}), 400
            
        ticket_number = generate_ticket_number()
        
        execute_query(
            """INSERT INTO registrations (name, email, phone, organization, event_type, ticket_number)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (name, email, phone, organization, event_type, ticket_number),
            commit=True
        )
        
        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "registration": {
                "name": name,
                "email": email,
                "ticket_number": ticket_number,
                "event": event_type
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. CONTACT INQUIRY ENDPOINT
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        
        if not name or not email or not subject or not message:
            return jsonify({"error": "Missing required fields"}), 400
            
        execute_query(
            "INSERT INTO contacts (name, email, subject, message) VALUES (%s, %s, %s, %s)",
            (name, email, subject, message),
            commit=True
        )
        
        return jsonify({
            "success": True,
            "message": "Inquiry submitted successfully!"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. ADMIN: GET ALL REGISTRATIONS
@app.route('/api/admin/registrations', methods=['GET'])
def get_registrations():
    try:
        registrations = execute_query(
            "SELECT * FROM registrations ORDER BY created_at DESC",
            fetch_all=True
        )
        return jsonify(registrations or [])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. ADMIN: GET ALL CONTACT INQUIRIES
@app.route('/api/admin/contacts', methods=['GET'])
def get_contacts():
    try:
        contacts = execute_query(
            "SELECT * FROM contacts ORDER BY created_at DESC",
            fetch_all=True
        )
        return jsonify(contacts or [])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. ADMIN: CANCEL REGISTRATION
@app.route('/api/admin/registration/<int:reg_id>', methods=['DELETE'])
def cancel_registration(reg_id):
    try:
        # Check if exists
        reg = execute_query(
            "SELECT id FROM registrations WHERE id = %s",
            (reg_id,),
            fetch_one=True
        )
        if not reg:
            return jsonify({"error": "Registration not found"}), 404
            
        execute_query(
            "DELETE FROM registrations WHERE id = %s",
            (reg_id,),
            commit=True
        )
        return jsonify({"success": True, "message": "Registration cancelled successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6. ADMIN: GET STATISTICS
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        total_reg = execute_query("SELECT COUNT(*) as count FROM registrations", fetch_one=True)['count']
        total_contact = execute_query("SELECT COUNT(*) as count FROM contacts", fetch_one=True)['count']
        
        # Event breakdown count
        breakdown_rows = execute_query(
            "SELECT event_type, COUNT(*) as count FROM registrations GROUP BY event_type",
            fetch_all=True
        )
        
        breakdown = {row['event_type']: row['count'] for row in breakdown_rows} if breakdown_rows else {}
        
        return jsonify({
            "total_registrations": total_reg,
            "total_contacts": total_contact,
            "event_breakdown": breakdown
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run server locally on default port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
