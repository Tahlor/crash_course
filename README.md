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

The repository is static and `.github/workflows/pages.yml` deploys `master` to GitHub Pages.

GitHub requires Pages to be enabled once at the repository level with **Settings → Pages → Source: GitHub Actions**. The workflow requests automatic enablement as well, but GitHub Apps / Actions tokens may be denied permission to create the Pages site. After the one-time setting is enabled, pushes to `master` deploy automatically.
