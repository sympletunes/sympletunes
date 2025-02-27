from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

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
@app.route("/search_spotify", methods=["GET"])
def search_spotify():
    query = request.args.get("q")
    search_type = request.args.get("type", "track")  # track, artist, album
    
    if not query:
        return jsonify({"error": "Missing search query"}), 400

    access_token = get_access_token()
    if not access_token:
        return jsonify({"error": "Failed to get access token"}), 500

    url = f"https://api.spotify.com/v1/search?q={query}&type={search_type}&limit=5"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(url, headers=headers)
    return jsonify(response.json())

# Run Flask server
if __name__ == "__main__":
    app.run(debug=True, port=5000)
