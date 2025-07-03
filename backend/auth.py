import os
import jwt
from flask import request, jsonify, g
from functools import wraps

# Load Clerk public key
CLERK_JWT_PUBLIC_KEY = None
try:
    with open("clerk_public_key.pem", "r") as f:
        CLERK_JWT_PUBLIC_KEY = f.read()
except FileNotFoundError:
    # fallback to environment variable
    CLERK_JWT_PUBLIC_KEY = os.getenv("CLERK_JWT_PUBLIC_KEY")
    if CLERK_JWT_PUBLIC_KEY:
        CLERK_JWT_PUBLIC_KEY = CLERK_JWT_PUBLIC_KEY.replace("\\n", "\n")
    else:
        raise Exception("Missing Clerk public key. Provide either clerk_public_key.pem or set CLERK_JWT_PUBLIC_KEY in env.")

def verify_clerk_token(token):
    try:
        payload = jwt.decode(
            token,
            CLERK_JWT_PUBLIC_KEY,
            algorithms=["RS256"],
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
