from flask import Flask, redirect, request, render_template, session, jsonify
from requests_oauthlib import OAuth2Session
from openai import OpenAI
from dotenv import load_dotenv
import requests
import os

# Load .env variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super-secret-dev-key")

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# OAuth and Bungie config
client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')
redirect_uri = "https://game-ai-19pg.onrender.com/callback"
auth_base_url = "https://www.bungie.net/en/OAuth/Authorize"
token_url = "https://www.bungie.net/platform/app/oauth/token/"

# Home route: redirect to Bungie login or show game
@app.route("/")
def index():
    if 'oauth_token' in session:
        return render_template("game.html")
    else:
        oauth = OAuth2Session(client_id, redirect_uri=redirect_uri)
        auth_url, state = oauth.authorization_url(auth_base_url)
        session['oauth_state'] = state
        return redirect(auth_url)
      
# OAuth callback
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

#telling the AI how to respond 
def load_prompt(path):
    with open(path, "r", encoding='utf-8') as f:
        return f.read() 
    
# Store transcript from frontend
@app.route("/get_transcript", methods=["GET", "POST"])
def getTranscript():
    message = request.args.get('msg', 'No transcript sent')
    session['transcript'] = message
    return jsonify({'stored': f'You said: {message}'})

# Generate AI response
@app.route("/post_transcript", methods=['POST'])
def postTranscript():
    incoming_data = request.get_json()
    transcript = session.get("transcript", "")
    value1 = incoming_data.get("value1", "")

    

    try:
        base_prompt = load_prompt('prompts/assistantActions.txt')
        prompt = f"{base_prompt}\nUser command: \"{value1} {transcript}\""
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format="json",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        ai_message = response.choices[0].message.content
        return jsonify({"status": "success", "response": ai_message})

    except Exception as e:
        print("ERROR in /post_transcript:", e)
        return jsonify({"status": "error", "message": str(e)})

# Run server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
