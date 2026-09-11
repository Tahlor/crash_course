# crash_course

A simple webapp/repository for learning things quickly on a phone.

## Structure

Courses live beneath subject folders. Company-, role-, exam-, or situation-specific variants live beneath the subject.

```text
/
├── index.html
├── COURSE_AUTHORING.md
├── STATE_ARCHITECTURE.md
├── server/
│   ├── state_api.py                     # single-user synced state API
│   ├── crash-course-state.service       # systemd service for Archimedes
│   ├── nginx-crash-course-state.conf    # same-origin API proxy
│   └── update_crash_course.sh           # git → webroot deploy/sync
└── leetcode/
    ├── index.html
    └── amazon/
        ├── index.html          # guided lessons
        ├── practice.html       # mixed/adaptive recognition
        ├── code.html           # tiny implementation-reflex drills
        ├── cheatsheet.html     # dense pre-interview reference
        ├── app.js
        ├── state.js            # shared offline-first synced state
        ├── guided_sync.js
        ├── practice.js
        ├── practice_extra.js
        ├── practice_sync.js
        ├── code.js
        ├── code_sync.js
        ├── style.css
        ├── practice.css
        ├── code.css
        ├── cheatsheet.css
        ├── manifest.webmanifest
        └── sw.js
```

Current course:

- `leetcode/amazon/` — dense algorithms refresher for an Amazon Applied Scientist interview.

## Product principles

- Mobile-first: useful while sitting on a couch, airport seat, or in transit.
- Dense: assume the learner is smart and wants compression, not a semester course.
- No unexplained jargon: introduce the name after the intuition.
- Teach recognition: what clue in a problem should make a technique occur to you?
- Teaching practice is not the same as coding practice. A phone course should make the learner reason without requiring them to type a full program.
- Transfer matters: after guided lessons, hide the technique names and mix confusable problem families.
- Implementation practice should target the few dangerous lines/invariants before asking for a full program.
- Real coding practice links out to established problem banks such as LeetCode after the mental model is learned.
- The current product assumes one implicit user, `default`; there is no account UI.
- Progress, answers-in-progress, shuffled drill order, hints, and skill statistics sync across sessions through Archimedes while remaining cached locally for offline use.
- The state model is already keyed by user + course so future multi-user support does not require redesigning course progress.

The intended learning ladder is:

```text
guided lesson
    ↓
mixed recognition / adaptive weak-topic review
    ↓
implementation reflexes (fill/spot one critical line)
    ↓
full external coding problem
```

See `COURSE_AUTHORING.md` for the reusable teaching model and `STATE_ARCHITECTURE.md` for the persistence/sync model.

## Quality

`.github/workflows/quality.yml` checks JavaScript syntax, the Python state API, required static/deployment assets, sync wiring, offline-cache coverage, and key navigation links on every push to `master` and on pull requests.

## Deployment

### Active deployment: Archimedes

The live static site is currently served by nginx on Archimedes from:

```text
/var/www/html/projects/crash_course
```

Public course URL:

```text
https://taylorarchibald.com/projects/crash_course/leetcode/amazon/
```

Archimedes keeps a public clone at `/home/ubuntu/crash_course_deploy`. The versioned `server/update_crash_course.sh` is installed as `/home/ubuntu/update_crash_course.sh`; it fetches `master`, resets the clone to `origin/master`, validates the Python backend, rsyncs into the nginx web root, and restarts the state service when its code changes. The `ubuntu` user's crontab runs this sync every 5 minutes, so pushes to public `master` propagate automatically without needing server-side GitHub credentials.

The versioned service/proxy definitions are `server/crash-course-state.service` and `server/nginx-crash-course-state.conf`. The course state API runs locally on Archimedes and is proxied by nginx at:

```text
https://taylorarchibald.com/projects/crash_course/api/state
```

It currently resolves every request to the implicit `default` user and stores persistent state in SQLite outside the git checkout. See `STATE_ARCHITECTURE.md`.

### GitHub Pages

`.github/workflows/pages.yml` remains as a manual-only static fallback. Archimedes is the active deployment because cross-session state requires a backend.
