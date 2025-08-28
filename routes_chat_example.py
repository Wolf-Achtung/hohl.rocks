"""
Example chat routes illustrating SSE streaming with request IDs.

This file provides two endpoints:

* ``/chat/stream``: sends server-sent events (SSE) tokens. The request ID (``rid``) is
  extracted from the query parameters or from ``request.state.rid`` (set by the
  RequestIdMiddleware). Each event uses the request ID as its event ID for
  correlating with the client. A ready event is sent immediately, followed by
  simulated token chunks. This is a minimal example; in production, you
  integrate with your language model and yield tokens as they arrive.

* ``/chat``: synchronous JSON fallback. Returns the full answer once the
  generation is complete and includes the request ID in the response headers.

Use this file as a template; replace the simulated generation with your own
backend logic.
"""

import asyncio
import json
import uuid
from typing import AsyncIterator

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse


router = APIRouter()


@router.get("/chat/stream")
async def chat_stream(request: Request, q: str = "", rid: str | None = None):
    """Stream tokens as SSE with a request ID.

    The request ID is read from the ``rid`` query parameter or from
    ``request.state.rid`` (populated by the RequestIdMiddleware). If neither is
    set, a new ID is generated. Each yielded event sets ``id`` to the request
    ID for easy client correlation.
    """
    # Use provided rid or fallback to middleware state or generate
    rid = rid or getattr(request.state, "rid", uuid.uuid4().hex[:12])

    async def event_generator() -> AsyncIterator[dict]:
        # send a ready event
        yield {"event": "ready", "id": rid, "data": json.dumps({"rid": rid})}
        # Simulate token streaming. Replace with your own model integration.
        tokens = ["Dies ", "ist ", "eine ", "Beispiel-", "Antwort."]
        for tok in tokens:
            # If client closes connection, exit
            if await request.is_disconnected():
                break
            await asyncio.sleep(0.3)
            yield {"event": "token", "id": rid, "data": tok}
        # End
        yield {"event": "done", "id": rid, "data": ""}

    return EventSourceResponse(event_generator(), headers={"X-Request-ID": rid})


@router.post("/chat")
async def chat_json(request: Request):
    """Synchronous fallback returning the full answer.

    This endpoint returns the entire answer in one response. The request ID is
    taken from ``request.state`` or generated and echoed back in the response
    headers.
    """
    rid = getattr(request.state, "rid", uuid.uuid4().hex[:12])
    body = await request.json() if await request.body() else {}
    prompt = body.get("prompt", "")
    # Simulate generation by echoing prompt reversed (replace with real model call)
    answer = prompt[::-1]
    return JSONResponse({"rid": rid, "answer": answer}, headers={"X-Request-ID": rid})