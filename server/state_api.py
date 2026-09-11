#!/usr/bin/env python3
import json
import os
import sqlite3
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = os.environ.get("CRASH_COURSE_HOST", "127.0.0.1")
PORT = int(os.environ.get("CRASH_COURSE_PORT", "8766"))
DEFAULT_USER_ID = os.environ.get("CRASH_COURSE_USER", "default")
DEFAULT_COURSE_ID = os.environ.get("CRASH_COURSE_COURSE", "leetcode/amazon")
DB_PATH = Path(os.environ.get(
    "CRASH_COURSE_DB",
    str(Path.home() / ".local/share/crash_course/state.sqlite3"),
))
MAX_BODY = 256 * 1024
LOCK = threading.Lock()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.execute("""
        CREATE TABLE IF NOT EXISTS course_state (
            user_id TEXT NOT NULL,
            course_id TEXT NOT NULL,
            revision INTEGER NOT NULL,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_id, course_id)
        )
    """)
    return db


def read_state(db):
    row = db.execute(
        "SELECT revision, state_json, updated_at FROM course_state WHERE user_id=? AND course_id=?",
        (DEFAULT_USER_ID, DEFAULT_COURSE_ID),
    ).fetchone()
    if not row:
        return 0, None, None
    return row[0], json.loads(row[1]), row[2]


def write_state(db, state, revision):
    state = dict(state)
    state["schemaVersion"] = int(state.get("schemaVersion", 1))
    state["userId"] = DEFAULT_USER_ID
    state["courseId"] = DEFAULT_COURSE_ID
    updated = now_iso()
    db.execute(
        """
        INSERT INTO course_state(user_id, course_id, revision, state_json, updated_at)
        VALUES(?,?,?,?,?)
        ON CONFLICT(user_id, course_id) DO UPDATE SET
          revision=excluded.revision,
          state_json=excluded.state_json,
          updated_at=excluded.updated_at
        """,
        (DEFAULT_USER_ID, DEFAULT_COURSE_ID, revision,
         json.dumps(state, separators=(",", ":"), sort_keys=True), updated),
    )
    db.commit()
    return state, updated


class Handler(BaseHTTPRequestHandler):
    server_version = "CrashCourseState/1.0"

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}")

    def send_json(self, status, payload):
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            return self.send_json(200, {"ok": True, "userId": DEFAULT_USER_ID, "courseId": DEFAULT_COURSE_ID})
        if path != "/state":
            return self.send_json(404, {"error": "not_found"})
        with LOCK, connect() as db:
            revision, state, updated = read_state(db)
        self.send_json(200, {
            "revision": revision,
            "state": state,
            "updatedAt": updated,
            "userId": DEFAULT_USER_ID,
            "courseId": DEFAULT_COURSE_ID,
        })

    def do_PUT(self):
        if urlparse(self.path).path != "/state":
            return self.send_json(404, {"error": "not_found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self.send_json(400, {"error": "invalid_content_length"})
        if length <= 0 or length > MAX_BODY:
            return self.send_json(413, {"error": "invalid_body_size"})
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            incoming = payload["state"]
            base_revision = int(payload.get("baseRevision", 0))
            if not isinstance(incoming, dict):
                raise TypeError("state must be an object")
        except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
            return self.send_json(400, {"error": "invalid_json", "detail": str(exc)})

        with LOCK, connect() as db:
            current_revision, current_state, updated = read_state(db)
            if base_revision != current_revision:
                return self.send_json(409, {
                    "error": "revision_conflict",
                    "revision": current_revision,
                    "state": current_state,
                    "updatedAt": updated,
                })
            new_revision = current_revision + 1
            saved, updated = write_state(db, incoming, new_revision)
        self.send_json(200, {
            "revision": new_revision,
            "state": saved,
            "updatedAt": updated,
        })


if __name__ == "__main__":
    with connect():
        pass
    print(f"Crash course state API: http://{HOST}:{PORT} user={DEFAULT_USER_ID} course={DEFAULT_COURSE_ID}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
