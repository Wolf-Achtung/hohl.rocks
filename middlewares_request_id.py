"""
middlewares_request_id.py — Starlette/FastAPI middleware for request correlation.
"""
from __future__ import annotations
import logging, time, uuid
from typing import Callable, Awaitable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

LOG = logging.getLogger("uvicorn.access")

class RequestIdMiddleware(BaseHTTPMiddleware):
    """Attach a request id to each request and log basic access info."""
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        rid = (request.headers.get("X-Request-ID") or request.query_params.get("rid") or uuid.uuid4().hex[:12])
        request.state.rid = rid
        start = time.time()
        response: Response | None = None
        try:
            response = await call_next(request)
            return response
        finally:
            duration_ms = int((time.time() - start) * 1000)
            if response is not None:
                response.headers.setdefault("X-Request-ID", rid)
                client_ip = request.client.host if request.client else "-"
                LOG.info("rid=%s ip=%s %s %s status=%s dur_ms=%s",
                         rid, client_ip, request.method, request.url.path,
                         getattr(response, "status_code", 0), duration_ms)
