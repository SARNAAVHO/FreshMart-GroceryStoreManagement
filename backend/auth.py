import os
import json
from flask import request, jsonify, g
from functools import wraps
from urllib.request import urlopen
from dotenv import load_dotenv
import jwt
from jwt import get_unverified_header, ExpiredSignatureError, InvalidTokenError
from jwt.algorithms import RSAAlgorithm  # Explicit import for RSA handling

# Load environment variables
load_dotenv()
JWKS_URL = os.getenv("CLERK_JWKS_URL")

if not JWKS_URL:
    raise Exception("Missing Clerk JWKS URL. Set CLERK_JWKS_URL in environment variables.")

# Fetch the signing key dynamically from Clerk's JWKS
def get_signing_key(token):
    header = get_unverified_header(token)
    jwks = json.loads(urlopen(JWKS_URL).read())
    
    for key in jwks["keys"]:
        if key["kid"] == header["kid"]:
            # Explicitly use RSAAlgorithm for RS256 keys
            return RSAAlgorithm.from_jwk(json.dumps(key))
            
    raise Exception("Signing key not found for token")

# Verify Clerk JWT token
def verify_clerk_token(token):
    try:
        signing_key = get_signing_key(token)
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={
                "verify_aud": False,
                "verify_iss": True,
                "verify_sub": True,
                "verify_nbf": True
            }
        )
        return payload
    except ExpiredSignatureError:
        raise Exception("Token has expired")
    except InvalidTokenError as e:
        raise Exception(f"Invalid token: {e}")
    except Exception as e:
        raise Exception(f"Verification error: {str(e)}")

# Flask route decorator for authentication
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return '', 200

        auth_header = request.headers.get("Authorization")
        print("🔒 Incoming Authorization:", auth_header)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = auth_header.split("Bearer ")[1]
        try:
            payload = verify_clerk_token(token)
            g.user_id = payload.get("sub")
            print("✅ Authenticated user:", g.user_id)
        except Exception as e:
            print("Auth error:", e)
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated