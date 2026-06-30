import os

def load_env_file():
    """
    Manually parses the local .env file to load environment variables.
    """
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    # Remove surrounding quotes if present
                    val = val.strip().strip("'").strip('"')
                    os.environ[key.strip()] = val

# Load environment variables from .env
load_env_file()

# Load API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Fallback check for Streamlit secrets if needed (without importing streamlit at the top level)
if not GROQ_API_KEY or not GEMINI_API_KEY:
    try:
        import streamlit as st
        if not GROQ_API_KEY:
            GROQ_API_KEY = st.secrets.get("GROQ_API_KEY")
        if not GEMINI_API_KEY:
            GEMINI_API_KEY = st.secrets.get("GEMINI_API_KEY")
    except Exception:
        pass