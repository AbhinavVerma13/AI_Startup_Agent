import os
import streamlit as st

def load_env_file():
    """
    Manually parses the local .env file to load environment variables.
    """
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

# Load environment variables from .env
load_env_file()

# ---------------------------------------------------------
# Load Groq API Key (Priority: .env file -> Streamlit Secrets)
# ---------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    try:
        # Works on Streamlit Community Cloud
        GROQ_API_KEY = st.secrets["GROQ_API_KEY"]
    except Exception:
        # Fallback local key
        GROQ_API_KEY = "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"