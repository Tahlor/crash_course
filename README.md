# Amazon Coding Crash Course

A dense, mobile-first algorithms refresher for an Amazon Applied Scientist interview, designed for an experienced programmer who is years removed from algorithms and has not used LeetCode.

## Design goals

- Assume programming competence, but **no remembered algorithms jargon**.
- Teach the intuition before the name or optimal implementation.
- Emphasize recognition: *what clues in the prompt should make this technique occur to me?*
- Bias toward the Amazon Selection & Catalog Systems / Item & Relationship work: product identity, connected groups, graphs, retrieval, ranking, and scale.
- Keep the recommended path to roughly **2.5 hours**, with an emergency short pass and a fuller pass.
- Work well on a phone and retain progress locally.
- Cache the core course for offline reading after the first visit.

## Tracks

### Emergency pass
Big-O/Python containers, hashing, graph BFS/DFS, Union-Find, heaps/Top-K, and sliding window.

### 2.5-hour recommended pass
Adds sorting/two pointers, dependency ordering/topological sort, Dijkstra, prefix sums, binary search on the answer, and trees/recursion.

### Fuller pass
Adds basic dynamic programming and secondary patterns; combine it with the linked practice problems for roughly a half-day review.

## External supplements

The course links selectively to:

- VizLearn for interactive visualizations when animation helps explain mechanics.
- LeetCode for one representative practice problem after each concept.

These are supplements, not prerequisites.

## Deployment

The site is static (`index.html`). `.github/workflows/pages.yml` deploys `master` to GitHub Pages.

GitHub requires Pages to be enabled once at the repository level with **Settings → Pages → Source: GitHub Actions**. The workflow also requests automatic enablement, but GitHub Apps / Actions tokens can be denied permission to create the Pages site; after the one-time repository setting is enabled, future pushes deploy automatically.
