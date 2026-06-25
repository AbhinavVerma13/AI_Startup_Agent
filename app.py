import streamlit as st
import requests
from config import GROQ_API_KEY

st.set_page_config(page_title="AI Startup Builder", page_icon="🚀")

# AI Function (Using Groq API with auto-fallback)
def ask_ai(prompt, mode):
    # Fallback to local templates if key is missing/invalid
    if not GROQ_API_KEY.strip().startswith("gsk_"):
        if mode == "business":
            return f"### 📝 Business Plan for {name}\n1. **Executive Summary**: A startup in {industry} focused on: '{idea}'.\n2. **Target Customers**: Digital users looking for convenience.\n3. **Revenue Model**: Subscription charges."
        elif mode == "marketing":
            return f"### 📣 Marketing Strategy for {name}\n1. **Channels**: Focus on LinkedIn and Instagram ads.\n2. **SEO**: Target terms like '{industry} service near me'.\n3. **Launch Offer**: Flat 20% discount on registration."
        else:
            return f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial; text-align:center; background:#f4f7f6; padding:50px;">
                <h1 style="color:#007bff;">Welcome to {name}</h1>
                <p>{idea}</p>
                <button style="background:#ffc107; border:none; padding:10px 20px; font-weight:bold; border-radius:4px; cursor:pointer;">Join Waitlist</button>
            </body>
            </html>
            """

    # Call the Groq Chat Completions API
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-8b-instant",  # Groq's fast free model
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except:
        return "Error connecting to Groq API"

# Title
st.title("🚀 AI Startup Builder Agent")
st.write("Generate a Business Plan, Marketing Strategy and Landing Page from your startup idea.")

# User Input
name = st.text_input("Startup Name")
industry = st.selectbox(
    "Industry",
    ["Technology", "Education", "Healthcare", "E-Commerce", "Food"]
)
idea = st.text_area("Describe Your Startup Idea")

# Generate Button
if st.button("Generate Startup Package"):
    with st.spinner("Generating..."):
        business_plan = ask_ai(
            f"Create a business plan for {name} in {industry}. Idea: {idea}", "business"
        )
        marketing_plan = ask_ai(
            f"Create a marketing strategy for {name}. Idea: {idea}", "marketing"
        )
        landing_page = ask_ai(
            f"Create a complete HTML landing page code for {name}. Idea: {idea}. Return ONLY HTML code.", "html"
        )

    tab1, tab2, tab3 = st.tabs(
        ["Business Plan", "Marketing Strategy", "Landing Page"]
    )

    with tab1:
        st.write(business_plan)

    with tab2:
        st.write(marketing_plan)

    with tab3:
        st.iframe(landing_page, height=500)
        st.download_button(
            "Download HTML",
            landing_page,
            "index.html",
            "text/html"
        )