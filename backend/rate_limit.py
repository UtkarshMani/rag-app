from fastapi import Request, HTTPException
from starlette.responses import Response
import time
from typing import Dict

# Simple in-memory rate limiter (per IP)
RATE_LIMIT = 30  # requests per window
RATE_PERIOD = 60  # seconds
rate_cache: Dict[str, int] = {}

async def rate_limiter(request: Request, call_next):
    """Simple rate limiting middleware"""
    ip = request.client.host
    now = time.time()
    window = int(now // RATE_PERIOD)
    key = f"{ip}:{window}"
    
    # Clean old entries (simple cleanup)
    current_window = int(time.time() // RATE_PERIOD)
    keys_to_remove = [k for k in rate_cache.keys() if int(k.split(':')[1]) < current_window - 1]
    for k in keys_to_remove:
        del rate_cache[k]
    
    # Check rate limit
    count = rate_cache.get(key, 0)
    if count >= RATE_LIMIT:
        raise HTTPException(
            status_code=429, 
            detail=f"Rate limit exceeded. Max {RATE_LIMIT} requests per {RATE_PERIOD} seconds."
        )
    
    # Increment counter
    rate_cache[key] = count + 1
    
    # Process request
    response = await call_next(request)
    return response

def get_rate_limit_info(ip: str) -> Dict[str, int]:
    """Get current rate limit status for an IP"""
    now = time.time()
    window = int(now // RATE_PERIOD)
    key = f"{ip}:{window}"
    current_count = rate_cache.get(key, 0)
    
    return {
        "requests_made": current_count,
        "rate_limit": RATE_LIMIT,
        "window_seconds": RATE_PERIOD,
        "requests_remaining": max(0, RATE_LIMIT - current_count)
    }
