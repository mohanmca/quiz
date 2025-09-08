# Session Notes — 2025-09-08

What changed
- Added article pages for all quizzes under `programming/articles/` and wired them via `articleFile` in `programming/data/json/surveys.json` so the UI shows a “Read Article” button.
- Each article mirrors the existing Rabin–Karp article’s structure: header/toolbar, a concise table of contents, focused conceptual sections, and at least one Python code block.

New articles
- leetcode-medium-python.html — stack, sliding window, heap, BFS, topological sort.
- python-internals.html — object model, refcount/GC, __slots__, descriptors.
- python-data-structures.html — lists/dicts/sets, heap, deque.
- python-dunder-methods.html — repr/str, iteration, comparison, context managers.
- python-type-internals.html — object size, immutability, memoryview.
- jvm-internals.html — memory regions, GC concepts, JIT (with Python analogies).
- golang-internals.html — scheduler/channels/GC (with Python analogies).
- scala-slick-api.html — schema DSL, composable queries (SQLAlchemy analogy).
- advanced-data-structures-python.html — Trie, Monotonic Stack, Union-Find.
- aws-k8s-secrets.html — IRSA, ESO, Secrets Manager (boto3 snippet).
- crypto-derivatives.html — PnL, funding, margin computations.
- oms-fix-questions.html — order lifecycle, FIX parsing in Python.
- airflow-programming.html — DAGs, operators, executors with a tiny DAG.
- aws-policy-permissions.html — evaluation logic, cross-account, STS assume-role.
- terraform-terragrunt.html — modules/state, Terragrunt DRY, simple HCL rendering.
- bit-manipulation-coding.html — XOR, masks, popcount.
- apache-kafka-part1.html — partitions, acks, Python producer.
- apache-kafka-broker-part2.html — ISR, quorum, simple majority check.
- apache-kafka-consumer-part3.html — groups, offsets, Python consumer.
- bitwise-operations-part1.html — masks, parity, XOR swap.
- fenwick-tree-fundamentals.html — BIT implementation and range sum helper.
- postgres-data-model-indexing.html — normalization, index types, diagnostics.
- postgres-query-planning-internals.html — cost model, joins, stats, EXPLAIN.
- postgres-vacuum-autovacuum-deep-dive.html — visibility/HOT, freezing, monitoring.

What was tricky
- Balancing completeness vs. brevity: several quizzes (Kafka/Postgres/OMS) have many questions and deep subtopics. I structured the articles to cover core concepts and representative code while keeping each page concise and readable.
- Non-Python domains (JVM/Go/Scala) still needed Python code examples per requirement. I included small Python analogies (graph reachability, queues, SQLAlchemy) to satisfy this constraint without misleading language specifics.
- Ensuring links appear: the UI only renders “Read Article” when `articleFile` is set in `surveys.json`. I updated every entry accordingly and kept filenames hyphenated lowercase.

Follow-ups
- If you want per-question anchors or a coverage checklist auto-generated from question JSON, we can add a small build step to extract titles and inject anchors into the article pages.
- We can expand articles over time with more examples, diagrams, or links to source references.

