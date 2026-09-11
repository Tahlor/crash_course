# State architecture

## Current product assumption

`crash_course` is currently a personal tool for one person. The application therefore has one implicit user:

```text
user_id = default
```

There is intentionally no login screen, account picker, profile UI, or user-management code in the course experience.

The goal is that progress follows the learner across browsers/devices/sessions while the app still works offline.

## Current state flow

```text
browser UI
   ↓
localStorage cache
   ↕
state.js
   ↕ HTTPS, same origin
Archimedes state API
   ↓
SQLite
```

The browser remains offline-first. Existing local keys are migrated automatically and kept as compatibility keys:

- `amazon-track`
- `amazon-done`
- `amazon-skill-stats`

The canonical browser object is namespaced by both user and course:

```text
crash-course:default:leetcode/amazon:state:v1
```

The state object contains:

- selected course track
- completed lessons
- aggregate skill statistics
- guided-lesson in-progress answers/hints/scroll position
- mixed-practice shuffled order, current problem/decision, answer, hints, and session score
- code-reflex shuffled order, current item, answer, and session score

The server stores the state in SQLite with this logical key:

```text
(user_id, course_id)
```

Today the API resolves both values internally to `default` and `leetcode/amazon`; clients do not choose a user.

## Conflict behavior

The server maintains a monotonically increasing revision. Clients PUT against the revision they last read. A stale client receives `409 revision_conflict`, merges the newer server state with its local state, and retries.

Merge policy is deliberately simple for the current one-person usage:

- completed lessons: set union
- skill counters: component-wise maximum, preventing an older device from rolling progress backward
- course track: newest timestamp wins
- in-progress session for each mode: newest timestamp wins

This is sufficient for normal sequential use across phone/desktop sessions. It is not intended to be a collaborative real-time data model.

## Deployment

The static client is served from Archimedes at:

```text
https://taylorarchibald.com/projects/crash_course/
```

The state endpoint is same-origin:

```text
/projects/crash_course/api/state
```

The backend implementation is `server/state_api.py`. It listens only on loopback and nginx proxies the public state path to it.

Persistent data lives outside the git checkout in:

```text
~/.local/share/crash_course/state.sqlite3
```

Deploying/resetting the repository therefore does not erase learner state.

## Future multi-user support

Do not redesign the course data model when multi-user support is added. Add an identity layer in front of the existing `(user_id, course_id)` key.

Recommended progression:

1. Add authentication/session middleware.
2. Resolve the authenticated principal to a stable `user_id`.
3. Stop hardcoding `default` in the server.
4. Keep the same course-state API semantics and SQLite key shape.
5. Add account/profile UI only when there is an actual second user or product need.

For a larger deployment, SQLite can be replaced by Postgres without changing the browser-facing state schema.

## Security boundary

The current deployment intentionally optimizes for a single low-stakes personal course and does not implement application-level accounts. Before exposing meaningful private data or supporting other people, authentication and authorization must be added so one user cannot read or overwrite another user's course state.
