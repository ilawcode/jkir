# Project: File Comparison Tool

**Core Value:** Provide an intuitive side-by-side JSON and XML comparison feature within the existing file explorer interface.

## What This Is
A feature addition to the current application that allows users to select two JSON or XML files and compare them in the code editor tab. Differences (added, deleted, modified lines) should be highlighted clearly.

## Requirements

### Validated
- ✓ [Existing file explorer functionality] — existing
- ✓ [Existing CodeMirror 6 code editor] — existing

### Active
- [ ] REQ-01: Users can right-click a JSON or XML file to initiate a compare action ("Karşılaştır").
- [ ] REQ-02: If one file is currently open, right-clicking a second file and selecting "compare" will orchestrate a diff view between the previously active file and the new target file.
- [ ] REQ-03: The comparison view must exclusively use the code editor mode.
- [ ] REQ-04: Differences (additions, deletions, modifications) must be highlighted distinctively to ensure high readability.
- [ ] REQ-05: The feature should be seamless and understandable without any confusing popups.

### Out of Scope
- [Comparing non-JSON/XML files] — Feature targets structured data formats currently supported by the app.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Implement compare in code editor tab | Code editor is the most natural spatial fit for visual file diffs | — Pending |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-14 after initialization*
