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
7. **Where can they do real coding practice?** Link to one or two closely analogous LeetCode problems.

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

End with one or two links to similar LeetCode problems. The course teaches the pattern; LeetCode verifies that the learner can implement it.

## Mobile rules

- No mandatory free-text coding.
- Large tap targets.
- One decision per screen-sized chunk.
- Never hide the explanation behind a wrong-answer penalty.
- Progress should survive refreshes locally.
- Core lesson content should cache for offline reading.
- Avoid giant code blocks; show only the lines that encode the technique.

## Course selection

Each specialized course should have at least:

- an emergency path for the highest-value concepts;
- a recommended path;
- a fuller path for lower-priority breadth.

Course authors should explicitly prioritize material based on the learner's goal rather than pretending every topic is equally valuable.
