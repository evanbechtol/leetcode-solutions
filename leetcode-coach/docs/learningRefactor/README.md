# LeetCode Coach Learn Redesign
## Milestone Document Index

Each milestone is intentionally stored in a separate Markdown file so an AI coding session can load only the requirements relevant to the current unit of work.

## Recommended order

1. [`M0_BASELINE_MIGRATION_SAFETY.md`](./M0_BASELINE_MIGRATION_SAFETY.md)  
   Protect existing Learn behavior with tests and migration safety.

2. [`M1_LEARN_DOMAIN_MODEL.md`](./M1_LEARN_DOMAIN_MODEL.md)  
   Introduce scalable curriculum metadata, modules, relationships, and validation.

3. [`M2_NAVIGATION_ROUTING.md`](./M2_NAVIGATION_ROUTING.md)  
   Split Learn into Curriculum, Library, Patterns, Advanced, and canonical topic routes.

4. [`M3_SEARCHABLE_TOPIC_LIBRARY.md`](./M3_SEARCHABLE_TOPIC_LIBRARY.md)  
   Add deterministic weighted concept search and filters.

5. [`M4_ORDERED_CORE_CURRICULUM.md`](./M4_ORDERED_CORE_CURRICULUM.md)  
   Make modules, prerequisites, and curriculum ordering user-visible.

6. [`M5_FOUNDATIONS_STRUCTURAL_CONTENT.md`](./M5_FOUNDATIONS_STRUCTURAL_CONTENT.md)  
   Add analysis/recursion/correctness foundations and split broad existing lessons.

7. [`M6_UNIVERSITY_CORE_ALGORITHMS.md`](./M6_UNIVERSITY_CORE_ALGORITHMS.md)  
   Add sorting, balanced trees, tries, Union-Find, topological sort, shortest paths, and MST.

8. [`M7_ASSESSMENTS_PROGRESS_V3.md`](./M7_ASSESSMENTS_PROGRESS_V3.md)  
   Add retrieval checks, module assessments, persisted lesson/module progress, and V3 migration.

9. [`M8_INTERVIEW_PATTERN_COMPLETENESS.md`](./M8_INTERVIEW_PATTERN_COMPLETENESS.md)  
   Add prefix sums, monotonic structures, intervals, grids, and bit manipulation.

10. [`M9_ADVANCED_HARDENING.md`](./M9_ADVANCED_HARDENING.md)  
    Add advanced topics and perform final search/content/accessibility/performance hardening.

## Release checkpoints

- **After M4:** Learn information architecture complete.
- **After M6:** Core DSA content complete.
- **After M7:** Core DSA learning system complete.
- **After M8:** Core DSA + interview-pattern system complete.

## AI usage recommendation

For an implementation chat, load:

1. this index only if milestone selection is needed;
2. exactly one milestone document;
3. only the relevant repository files for that milestone.

Avoid loading the full program requirements unless cross-milestone architecture decisions are required.
