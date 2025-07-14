from flask import Flask, redirect, request, render_template, session
from requests_oauthlib import OAuth2Session
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super-secret-dev-key") 

client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')
redirect_uri = "https://game-ai-19pg.onrender.com/callback" 
auth_base_url = "https://www.bungie.net/en/OAuth/Authorize"
token_url = "https://www.bungie.net/platform/app/oauth/token/"

@app.route("/")
def index():
    if 'oauth_token' in session:
        return render_template("game.html")
    else:
        oauth = OAuth2Session(client_id, redirect_uri=redirect_uri)
        auth_url, state = oauth.authorization_url(auth_base_url)
        session['oauth_state'] = state
        return redirect(auth_url)

@app.route("/callback")
def callback():
    oauth = OAuth2Session(client_id, redirect_uri=redirect_uri, state=session.get('oauth_state'))
    token = oauth.fetch_token(
        token_url=token_url,
        client_secret=client_secret,
        authorization_response=request.url
    )
    session['oauth_token'] = token  
    return redirect("/")  

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
