import os
import json
import requests
import sqlite3
import hashlib
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from config import GROQ_API_KEY, GEMINI_API_KEY

app = Flask(__name__)
app.secret_key = os.urandom(24) # Set secure session key

DB_FILE = "users.db"

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Password Hashing Helper
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# Helper to call Groq API with JSON response format
def call_groq_api(prompt, api_key):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a world-class startup incubation agent. You output ONLY valid JSON objects. Never include markdown code wrappers (like ```json) in your response."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.7
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=45)
        if response.status_code == 200:
            res_json = response.json()
            content = res_json['choices'][0]['message']['content']
            return json.loads(content)
        else:
            print("Groq API Error Status:", response.status_code, response.text)
            return None
    except Exception as e:
        print("Groq API Request Exception:", str(e))
        return None

# Helper to call Gemini API with JSON response format
def call_gemini_api(prompt, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=45)
        if response.status_code == 200:
            res_json = response.json()
            content = res_json['candidates'][0]['content']['parts'][0]['text']
            return json.loads(content)
        else:
            print("Gemini API Error Status:", response.status_code, response.text)
            return None
    except Exception as e:
        print("Gemini API Request Exception:", str(e))
        return None

# Generate Local Fallback Template
def generate_local_fallback(name, industry, idea):
    biz_plan = f"""# Business Plan for {name}

## 1. Executive Summary
{name} is an innovative venture in the {industry} sector. Our primary mission is to solve this core problem: "{idea}". By leveraging modern techniques and efficient operations, we target immediate customer pain points and scale rapidly.

## 2. Target Market & Audience
* **Primary Segment:** Young professionals, office workers, and tech-savvy individuals.
* **Market Need:** High demand for convenience, speed, and quality services in the {industry} sector.
* **Market Trends:** Rapid shift towards on-demand delivery, digital booking, and custom subscriptions.

## 3. Revenue & Pricing Model
* **Direct Sales:** Pay-per-service model with competitive pricing options.
* **Premium Membership:** Monthly subscription for free delivery, loyalty points, and premium products.
* **Corporate Partnerships:** B2B packages for office locations and events.

## 4. Key Milestones (First 12 Months)
* **Q1:** Build the MVP (Minimum Viable Product) and launch local beta testing.
* **Q2:** Reach 500 active weekly transacting users.
* **Q3:** Secure key supply chain partners and expand delivery zones.
* **Q4:** Raise Seed funding for city-wide scaling.
"""

    marketing_strategy = f"""# Marketing Strategy for {name}

## 1. Pre-Launch Buzz Campaign
* **Waitlist Landing Page:** Drive traffic to the waitlist page with early access incentives.
* **Founder Journey:** Share behind-the-scenes building process on LinkedIn and Instagram to build personal connection.

## 2. Launch Campaigns
* **Incentivized Referrals:** Give both the referrer and referee a discount on their first transaction.
* **Location Takeover:** Geo-targeted digital ads in business hubs coupled with physical flyer drops.

## 3. SEO & Organic Traffic
* **High-Intent Keywords:** Target keywords like "on-demand {industry} in my area" and "best {industry} app".
* **Content Hub:** Write informative blog articles addressing common client challenges.
"""

    html_code = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name} - Elevate Your Day</title>
    <style>
        :root {{
            --primary: #0ea5e9;
            --dark: #0f172a;
            --light: #f8fafc;
            --slate: #475569;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: system-ui, -apple-system, sans-serif;
            background-color: var(--light);
            color: var(--dark);
            line-height: 1.6;
        }}
        header {{
            background: linear-gradient(135deg, var(--dark) 0%, #1e293b 100%);
            color: white;
            padding: 80px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}
        h1 {{ font-size: 3rem; font-weight: 800; margin-bottom: 20px; letter-spacing: -1px; }}
        header p {{ font-size: 1.25rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 32px auto; }}
        .btn {{
            background-color: var(--primary);
            color: white;
            padding: 14px 32px;
            font-size: 1rem;
            font-weight: 700;
            border: none;
            border-radius: 9999px;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
            transition: all 0.2s ease;
        }}
        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(14, 165, 233, 0.4);
        }}
        .container {{
            max-width: 800px;
            margin: 60px auto;
            padding: 0 20px;
        }}
        .card {{
            background: white;
            border: 1px solid #e2e8f0;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }}
        h2 {{ font-size: 1.75rem; margin-bottom: 16px; }}
        .card p {{ color: var(--slate); }}
        footer {{
            text-align: center;
            padding: 40px 20px;
            color: var(--slate);
            font-size: 0.9rem;
            border-top: 1px solid #e2e8f0;
        }}
    </style>
</head>
<body>
    <header>
        <h1>Welcome to {name}</h1>
        <p>{idea}</p>
        <button class="btn">Join the Waitlist</button>
    </header>
    <div class="container">
        <div class="card">
            <h2>Modern {industry} Redefined</h2>
            <p>We are building a smart, on-demand platform to solve your everyday challenges. Enter your email above to join our exclusive waitlist and get early access beta rewards!</p>
        </div>
    </div>
    <footer>
        &copy; 2026 {name}. All rights reserved.
    </footer>
</body>
</html>
"""

    return {
        "biz_plan": biz_plan,
        "marketing": marketing_strategy,
        "html_code": html_code,
        "evaluation": {
            "overall": 7.8,
            "market": 8.0,
            "problem": 7.0,
            "revenue": 8.5,
            "analysis": "This startup idea addresses a high-frequency daily convenience challenge. The market demand indicator is strong, though local operations scaling will require meticulous execution."
        },
        "offline_fallback": True
    }

# Routes
@app.route('/')
def index():
    # Render login screen if user is not in session
    if 'user_email' not in session:
        return render_template('index.html', logged_in=False, user_email=None)
        
    is_demo = not (GROQ_API_KEY and GROQ_API_KEY.startswith("gsk_")) and not (GEMINI_API_KEY and GEMINI_API_KEY.startswith("AIzaSy"))
    return render_template('index.html', logged_in=True, user_email=session['user_email'], is_demo=is_demo)

# Authentication API: Register
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    hashed = hash_password(password)
    
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed))
        conn.commit()
        conn.close()
        
        session['user_email'] = email
        return jsonify({"success": True, "message": "Account created successfully!"})
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists"}), 400
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Authentication API: Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    hashed = hash_password(password)
    
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0] == hashed:
            session['user_email'] = email
            return jsonify({"success": True, "message": "Logged in successfully!"})
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Authentication: Logout
@app.route('/logout')
def logout():
    session.pop('user_email', None)
    return redirect(url_for('index'))

@app.route('/api/generate', methods=['POST'])
def generate():
    # Protection: check authentication
    if 'user_email' not in session:
        return jsonify({"error": "Unauthorized. Please sign in first."}), 401
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name", "ChaiOnWheels")
    industry = data.get("industry", "Food & Beverage")
    idea = data.get("idea", "")

    if not idea:
        return jsonify({"error": "Idea description is required"}), 400

    # Custom AI System Prompts requesting structured JSON response
    prompt = f"""
    You are an elite Startup Incubator AI Agent. 
    For the startup named "{name}" in the industry "{industry}", with the core idea: "{idea}", perform the following:
    
    1. Write a professional, detailed Business Plan in Markdown format.
    2. Write an actionable, creative launch Marketing Strategy in Markdown format.
    3. Write a beautiful, single-file HTML landing page for this startup. It must contain:
       - Sleek, modern styling inside <style> tags (using variables, smooth gradients, nice fonts). Do NOT use Tailwind or bootstrap.
       - A header, a high-converting hero section with a waitlist input form, feature highlights, and a footer.
       - Make it fully responsive and visually gorgeous.
    4. Evaluate the startup idea on a scale of 1 to 10 across three categories: Market Demand, Problem Urgency, and Revenue Potential. Set Overall score as their average. Provide a 2-sentence summary evaluation.

    Return your output ONLY as a raw JSON object (conforming to the schema below). Do not wrap the JSON object in markdown blocks (e.g. do NOT use ```json).
    JSON Schema:
    {{
      "biz_plan": "Markdown string of business plan",
      "marketing": "Markdown string of marketing strategy",
      "html_code": "Full HTML code of landing page",
      "evaluation": {{
        "overall": float_overall_score,
        "market": float_market_score,
        "problem": float_problem_score,
        "revenue": float_revenue_score,
        "analysis": "Two-sentence summary evaluation analysis"
      }}
    }}
    """

    res_data = None
    
    # Try Groq API first
    if GROQ_API_KEY and GROQ_API_KEY.startswith("gsk_"):
        print("Attempting to call Groq API...")
        res_data = call_groq_api(prompt, GROQ_API_KEY)
        
    # Try Gemini API second
    if not res_data and GEMINI_API_KEY and GEMINI_API_KEY.startswith("AIzaSy"):
        print("Attempting to call Gemini API...")
        res_data = call_gemini_api(prompt, GEMINI_API_KEY)

    # Use local offline fallback if API keys are missing or failed
    if not res_data:
        print("Falling back to local generated template...")
        res_data = generate_local_fallback(name, industry, idea)

    return jsonify(res_data)

if __name__ == '__main__':
    # Run locally on port 5000
    app.run(debug=True, port=5000)