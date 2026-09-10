# crash_course

A simple static webapp/repository for learning things quickly on a phone.

## Structure

Courses live beneath subject folders. Company-, role-, exam-, or situation-specific variants live beneath the subject.

```text
/
├── index.html
├── COURSE_AUTHORING.md
└── leetcode/
    ├── index.html
    └── amazon/
        ├── index.html          # guided lessons
        ├── practice.html       # mixed/adaptive recognition
        ├── code.html           # tiny implementation-reflex drills
        ├── cram.html           # dense pre-interview reference
        ├── app.js
        ├── practice.js
        ├── code.js
        ├── style.css
        ├── practice.css
        ├── code.css
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
- Progress and lightweight skill statistics are local; courses should remain useful offline after the first load.

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

See `COURSE_AUTHORING.md` for the reusable teaching model.

## Quality

`.github/workflows/quality.yml` checks JavaScript syntax, required static assets, and key navigation links on every push to `master` and on pull requests.

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

Archimedes keeps a public clone at `/home/ubuntu/crash_course_deploy`. `/home/ubuntu/update_crash_course.sh` fetches `master`, resets the clone to `origin/master`, and rsyncs it into the nginx web root. The `ubuntu` user's crontab runs this sync every 5 minutes, so pushes to public `master` propagate automatically without needing server-side GitHub credentials.

### GitHub Pages

`.github/workflows/pages.yml` is also present, but GitHub Pages is not currently enabled at the repository level. It can remain a future fallback; the Archimedes deployment is the active path.