# Project State

## Overview
GSD Project initialized for adding comparative view to Jkir data viewer using manual bypass into YOLO mode.

## Technical Decisions
- Will be utilizing CodeMirror's inherent merge features (`@codemirror/merge`) as opposed to a purely custom react diff element, due to the existing strong dependency on `@codemirror/*`.

## Upcoming
- Running Phase 1 -> Context menu and comparative state injection
- Running Phase 2 -> Diff editor render
