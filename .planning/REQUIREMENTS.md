# Requirements

This file expands heavily on PROJECT.md requirements explicitly.

## REQ-01: Context Menu Compare Tool
- A user right clicking XML/JSON files should see a "Karşılaştır" context menu option.

## REQ-02: State orchestration 
- There needs to be state tracking the file to compare *against*. Typically this compares against the currently opened/active left/right pane.

## REQ-03: Exclusively in Editor Mode
- Only the "code editing" interface tab handles the comparisons visually. Tree views, graphs, etc. will not attempt to render differences.

## REQ-04: Deep CodeMirror Highlighting
- When two files are rendered in compare mode, CodeMirror highlighting logic explicitly showcases inserted, deleted, and modified rows of code intuitively. 

## REQ-05: Non-intrusive
- Normal usage must not be disrupted. Normal file click opens file routinely. 
