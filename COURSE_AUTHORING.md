# Crash Course authoring model

The point of this repo is not to reproduce textbooks. It is to help a smart learner get useful competence quickly, especially on a phone.

## Lesson anatomy

Each lesson should answer, in this order:

1. **What problem is this technique for?** Start with the intuition, not the formal name.
2. **What clue should trigger it?** Give recognizable wording from real problems.
3. **What is the minimum mental model?** One diagram, tiny example, or compact invariant.
4. **What tiny implementation pattern is worth remembering?** Prefer a 5–12 line skeleton over a full solution.
5. **What goes wrong most often?** State the trap explicitly.
6. **Can the learner reason through a teaching drill?** Use the flow below.
7. **Where can they do real coding practice?** Link to one or two closely analogous external practice problems when useful.

## Teaching drills: the important distinction

A teaching drill is **not** a miniature online judge. On a phone, requiring the learner to type a complete program mainly tests typing friction and syntax recall. The course should instead rehearse the decisions that distinguish someone who understands the algorithm from someone who does not.

A good drill is a sequence of short commitments:

### 1. First move

Give a small scenario and ask what family of approach they would try. Include plausible wrong answers, not joke distractors. Every wrong answer should explain *why it is tempting and why it loses*.

Examples:

- brute-force pairwise scan vs set lookup
- breadth-first vs depth-first search
- sort everything vs maintain a top-K heap
- sliding window vs prefix-sum dictionary

### 2. State / data structure

Ask what information the algorithm must retain while it runs.

Examples:

- values already seen
- queue of frontier nodes
- current window membership
- group representative
- indegree / unmet prerequisite count
- best-known distance

This is often the most educational question because it connects the algorithm name to its actual mechanics.

### 3. Invariant or update rule

Ask what must remain true after each step.

Examples:

- every node in the BFS queue has already been marked seen
- the sliding window contains no duplicates
- the size-K heap contains the best K candidates seen so far
- a topological-sort queue contains only nodes with zero unmet prerequisites

### 4. Complexity target

Do not ask learners to memorize complexity tables in isolation. Ask them to choose between realistic alternatives and explain what operation dominates.

### 5. Edge cases

Use tap-to-select edge cases. Mix essential cases with irrelevant distractors so the learner practices deciding what is worth saying before coding.

Good edge cases usually include:

- empty / single-element input
- duplicates
- disconnected graph
- cycles
- multiple equally good answers
- negative values when they change algorithm validity
- start already equals goal
- impossible answer

### 6. Progressive hints

Hints should reveal the trick in layers rather than immediately dumping the answer:

1. restate the useful equation/invariant;
2. name the data structure or perspective;
3. show the core update rule.

The learner should be able to stop after any hint and finish reasoning independently.

### 7. Model interview answer

Show a compact spoken answer that demonstrates how to communicate the solution:

- simple/brute-force idea if useful;
- improved idea;
- data structure and invariant;
- time and space complexity;
- one implementation trap.

This should sound like something a candidate could actually say in 20–40 seconds.

### 8. Real coding handoff

End with one or two links to similar real coding problems. The crash course teaches the pattern; an external judge can verify implementation under typing/compiler pressure.

## Mixed transfer practice

A learner who can solve a “Sliding Window” exercise while reading a lesson titled **Sliding Window** has not yet proved they can recognize the pattern. Every substantial course should therefore include a mixed-practice mode after the guided lessons.

Mixed practice should:

- hide the technique name until after the learner commits to an approach;
- mix nearby/confusable techniques, not just random unrelated questions;
- ask at least one follow-up about state, invariant, complexity, or a common trap;
- use fresh surface stories so the learner cannot memorize the original lesson wording;
- give explanatory feedback immediately;
- finish with a compact model answer and a route back to the lesson or external coding practice.

For algorithms, especially useful contrasts include BFS vs Dijkstra, sliding window vs prefix sums, graph traversal vs Union-Find, sorting everything vs a Top-K heap, and direct search vs binary search over a monotonic answer space.

## Adaptive review

If a course contains several independent skills, persist lightweight per-skill statistics locally. Wrong answers should make that skill more likely to appear in a future weak-topic session. Do not turn this into a punitive score or a fake precision metric; the purpose is simply to spend scarce review time where reasoning is least reliable.

A useful minimal record is:

```text
skill -> attempts, correct
```

The UI can expose rough accuracy and “not tested” states. Keep progress local unless a future course explicitly needs account-backed synchronization.

## Implementation reflex drills

Recognition is not enough if a candidate knows “this is BFS” but writes the one line that breaks BFS. Before sending the learner to a full coding environment, rehearse the small implementation decisions with disproportionate failure risk.

Good reflex drills are usually **fill one line**, **choose the correct ordering**, or **spot the bug**. They should test the invariant, not trivia about syntax.

Examples:

- check a Two Sum complement before inserting the current value;
- mark a BFS node seen when enqueueing, not when dequeuing;
- seed a prefix-frequency map with the empty prefix;
- query a prefix map before registering the current prefix;
- enqueue a dependent only when its indegree reaches zero;
- preserve `mid` when binary-searching for the first feasible answer;
- tolerate duplicate Dijkstra heap entries and skip stale pops.

The learner should be able to say *why* the correct line is necessary. A reflex drill should end with a one-sentence rule worth carrying into the interview.

## Recommended learning ladder

For skill-heavy technical material, use this progression when applicable:

```text
guided lesson
    ↓
mixed transfer practice
    ↓
implementation reflex drill
    ↓
full external practice / realistic task
```

Each layer removes one kind of support. Do not jump directly from explanation to a blank editor unless typing the full solution is itself the skill being taught.

## Mobile rules

- No mandatory free-text coding.
- Large tap targets.
- One decision per screen-sized chunk.
- Never hide the explanation behind a wrong-answer penalty.
- Progress should survive refreshes locally.
- Core lesson and practice content should cache for offline reading.
- Avoid giant code blocks; show only the lines that encode the technique.
- Prefer one-thumb interactions and avoid controls that require precise dragging.

## Course selection

Each specialized course should have at least:

- an emergency path for the highest-value concepts;
- a recommended path;
- a fuller path for lower-priority breadth;
- mixed transfer practice once the learner has seen the core techniques;
- implementation-reflex drills when a few lines or ordering mistakes are disproportionately costly.

Course authors should explicitly prioritize material based on the learner's goal rather than pretending every topic is equally valuable.
