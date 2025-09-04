"""
Middleware to map request IDs for tracing.

This middleware inspects the incoming request for an `X-Request-ID` header or `rid`
query parameter. If none is provided, it generates a random identifier. The request
identifier is stored on the request state for later use and is added to the
response headers. The middleware also logs the request along with its ID, IP,
method, path, status code and duration in milliseconds.

Usage (FastAPI):

    from fastapi import FastAPI
    from middlewares_request_id import RequestIdMiddleware

    app = FastAPI()
    app.add_middleware(RequestIdMiddleware)

In your SSE and JSON routes, read `request.state.rid` and return it as
`X-Request-ID` and as the SSE `id` field for end-to-end correlation.
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


log = logging.getLogger("uvicorn.access")


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        """Add or propagate a request ID, then log the request and response.

        The middleware checks for a header ``X-Request-ID`` or query parameter
        ``rid``. If neither is present, it generates a new 12-character ID. The
        ID is stored on ``request.state`` so downstream handlers can access it
        and is included in the response headers. A simple access log entry is
        also emitted for each request.
        """
        # Extract rid from header or query params, or generate a new one
        rid = (
            request.headers.get("X-Request-ID")
            or request.query_params.get("rid")
            or uuid.uuid4().hex[:12]
        )
        # Store on request.state
        request.state.rid = rid
        start = time.time()
        response = None
        try:
            response = await call_next(request)
            return response
        finally:
            duration_ms = int((time.time() - start) * 1000)
            if response is not None:
                # Ensure the request ID is echoed back
                response.headers.setdefault("X-Request-ID", rid)
            client_ip = request.client.host if request.client else "-"
            log.info(
                f"rid={rid} ip={client_ip} {request.method} {request.url.path} "
                f"status={getattr(response, 'status_code', 0)} dur_ms={duration_ms}"
            )