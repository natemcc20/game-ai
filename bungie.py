from flask import Flask, redirect, request, render_template, session, jsonify
from requests_oauthlib import OAuth2Session
import requests
import os
import json 

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super-secret-dev-key") 

client_id = os.getenv('CLIENT_ID')
api_key = os.getenv("OPENAI_API_KEY")
client_secret = os.getenv('CLIENT_SECRET')
redirect_uri = "https://game-ai-19pg.onrender.com/callback" 
auth_base_url = "https://www.bungie.net/en/OAuth/Authorize"
token_url = "https://www.bungie.net/platform/app/oauth/token/"
external_ai = "https://api.openai.com/v1/chat/completions"


@app.route("/")
def index():
    if 'oauth_token' in session:
        return render_template("game.html")
    else:
        oauth = OAuth2Session(client_id, redirect_uri=redirect_uri)
        auth_url, state = oauth.authorization_url(auth_base_url)
        session['oauth_state'] = state
        return redirect(auth_url)


@app.route("/callback", methods=["GET", "POST"])
def callback():
    oauth = OAuth2Session(client_id, redirect_uri=redirect_uri, state=session.get('oauth_state'))
    token = oauth.fetch_token(
        token_url=token_url,
        client_secret=client_secret,
        authorization_response=request.url
    )
    session['oauth_token'] = token  
    return redirect("/")  


@app.route("/get_transcript", methods=["GET", "POST"])
def getTranscript():
    message = request.args.get('msg', 'No transcript sent')
    session['transcript'] = message
    return jsonify({'stored': f'You said: {message}'})

    
@app.route("/post_transcript", methods=['POST'])
def postTranscript():
    
    incoming_data = request.get_json()
    transcript = session.get("transcript", "")

    if not api_key:
        return jsonify({"status": "error", "message": "OpenAI API key missing"}), 500

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    prompt = f"{incoming_data.get('value1', '')}\n{transcript}"

    payload = {
        "model": "gpt-4",
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(external_ai, headers=headers, json=payload)
        response.raise_for_status()

        ai_response = response.json()
        return jsonify({"status": "success", "external_api_response": ai_response})

    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)