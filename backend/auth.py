import jwt
import json
from flask import request, jsonify, g
from functools import wraps
from jwt import get_unverified_header, algorithms
from urllib.request import urlopen
from dotenv import load_dotenv
import os

load_dotenv()

# Clerk JWKS endpoint
JWKS_URL = os.getenv("CLERK_JWKS_URL")

def get_signing_key(token):
    header = get_unverified_header(token)
    jwks = json.loads(urlopen(JWKS_URL).read())
    for key in jwks["keys"]:
        if key["kid"] == header["kid"]:
            return algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
    raise Exception("Signing key not found for token")

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
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError as e:
        raise Exception(f"Invalid token: {e}")

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
            g.user_id = payload["sub"]
        except Exception as e:
            print("Auth error:", e)
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated
