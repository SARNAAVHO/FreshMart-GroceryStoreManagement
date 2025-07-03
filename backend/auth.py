import os
import json
from flask import request, jsonify, g
from functools import wraps
from urllib.request import urlopen
from dotenv import load_dotenv

# ✅ Correct PyJWT imports
import jwt
from jwt import get_unverified_header, ExpiredSignatureError, InvalidTokenError
from jwt import algorithms

# ✅ Load environment variables
load_dotenv()
JWKS_URL = os.getenv("CLERK_JWKS_URL")

if not JWKS_URL:
    raise Exception("Missing Clerk JWKS URL. Set CLERK_JWKS_URL in environment variables.")

# ✅ Fetch the signing key dynamically from Clerk's JWKS
def get_signing_key(token):
    header = get_unverified_header(token)
    jwks = json.loads(urlopen(JWKS_URL).read())
    for key in jwks["keys"]:
        if key["kid"] == header["kid"]:
            return algorithms.get_default_algorithms()["RS256"].from_jwk(json.dumps(key))
    raise Exception("Signing key not found for token")

# ✅ Verify Clerk JWT token
def verify_clerk_token(token):
    try:
        signing_key = get_signing_key(token)
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],  # Clerk uses RS256 by default
            options={"verify_aud": False}
        )
        return payload
    except ExpiredSignatureError:
        raise Exception("Token has expired")
    except InvalidTokenError as e:
        raise Exception(f"Invalid token: {e}")

# ✅ Flask route decorator for authentication
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return '', 200

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = auth_header.split("Bearer ")[1]
        try:
            payload = verify_clerk_token(token)
            g.user_id = payload.get("sub")  # Clerk user ID (safe access)
        except Exception as e:
            print("Auth error:", e)
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated
