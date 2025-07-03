import jwt
from flask import request, jsonify, g
from functools import wraps

# ✅ Load the Clerk public key from a .pem file (recommended)
with open("clerk_public_key.pem", "r") as f:
    CLERK_JWT_PUBLIC_KEY = f.read()

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
