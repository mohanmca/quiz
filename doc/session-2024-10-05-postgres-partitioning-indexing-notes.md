# Session Notes: PostgreSQL Partitioning & Indexing Quiz/Article

## What I Learned
- Deepened understanding of designing multi-level partition hierarchies (range → hash) tailored to crypto OMS workloads and why partition pruning alignment with business cycles matters.
- Revisited PostgreSQL 17 enhancements around partitioned indexes, runtime pruning, and foreign-key support, clarifying operational implications for new quiz content.
- Practiced weaving extensive operational guidance (automation, governance, monitoring) into a 5k-word static article while keeping it navigable.

## Tricky Points
- Ensuring the article exceeded the 5k-word requirement without drifting off-topic required iterative extensions with new sections (planner stats, governance, benchmarking).
- Balancing quiz coverage across 75 questions so every prompt requirement appeared at least once took deliberate mapping back to article sections.
- Managing existing dirty working tree items demanded careful isolation of new files and avoiding unintended modifications.
