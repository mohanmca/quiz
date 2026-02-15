Under "Postgers" Category, can you generate new quiz file like programming/articles/postgres-vacuum-autovacuum-deep-dive.html

with all the instructions for Postgres for following requirement

0. Use crypto order management system as example for below case, order, fill, account, instrument, stock, price
1. We need to understand different types of partitions
2. What are the difference between root, intermediary and leaf partitions
3. What happens if we create index on partitioned table how that affects
4. How many kinds of indexes are there?
5. How to create batch-wise indexes without locking larger table of size 100tb
6. Share utility function that can create sub-sub-level partition for a give table (parameter), where clause as string parameter, index name, sub-sub level that has range and range of hash example with detailed step by step
7. How many kinds of indexes are there, and when to choose what?
8. Write procedure and functions that could be used for above cases as reusable one
9. Assume postgresql 17 and above for case..
10. We need minimum 75 quiz for above cases to understand index and partitiones
11. How to batch index if a table is 100tb large and partitioned, what are practical issues, and how many ways to handle
12. What are all lock related things, for update skip, for update,
13. How to production safety, less downtime, no deadlock for above case
14. How to monitor indexing and partitioning using built-in features and tables, write reusable functions to track it
15. How to rollback, recovery for failures


