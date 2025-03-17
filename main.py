from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Enable CORS (Allow JavaScript to call this API from any origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Change this to your frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Replace with your actual Spotify Client ID and Secret
CLIENT_ID = "90fe5b0d44234919a3f125d45c702a03"
CLIENT_SECRET = "c72659b6b04541ebafd80b58fbf82a23"

# Function to get Spotify access token
def get_access_token():
    url = "https://accounts.spotify.com/api/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {"grant_type": "client_credentials", "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
    
    response = requests.post(url, headers=headers, data=data)
    return response.json().get("access_token")

# API Route to search for music on Spotify
@app.get("/search_spotify")
def search_spotify(q: str = Query(..., description="Search query"), search_type: str = "track"):
    """
    Search for tracks, artists, or albums on Spotify.
    """
    access_token = get_access_token()
    if not access_token:
        return {"error": "Failed to get access token"}

    url = f"https://api.spotify.com/v1/search?q={q}&type={search_type}&limit=5"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(url, headers=headers)
    return response.json()
