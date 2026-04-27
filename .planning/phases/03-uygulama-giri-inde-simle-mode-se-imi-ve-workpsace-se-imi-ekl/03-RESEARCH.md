# Phase 3 Research: Simple Mode & Workspace Selection

## Understanding the Request
The goal is to introduce a startup selection screen that offers two operating modes for the application:
1.  **Simple Mode (Ephemeral):**
    *   No need to create folders.
    *   A default file is already open and ready to edit.
    *   Files can be added and compared.
    *   No persistence; all files are deleted (not saved) across sessions.
2.  **Workspace Mode (Persistent):**
    *   The current behavior of the application (folders, files, saved to local storage).

### Features to Implement
*   **Startup Screen:** Shown on initial load unless a default mode is saved. Contains descriptions of both modes.
*   **Remember Choice:** A checkbox to "always open in this mode". Saved in `localStorage`.
*   **Top Bar Switcher:** An option in the header (`app/page.tsx` -> `header-right`) to switch between Simple and Workspace modes. Switching modes resets the default choice.
*   **Mode Logic:**
    *   `useCollections` currently handles persistence via `localStorage` implicitly or explicitly. We need to support an ephemeral mode (e.g., passing a flag to `useCollections` or maintaining a separate ephemeral state).
    *   `CollectionExplorer` in Simple mode might need to hide folder creation or be simplified to just a list of open files.

## Technical Investigation

### Current State (`app/page.tsx`)
*   The main view loads and relies on `isLoaded` from `useCollections`.
*   `useCollections` returns `collections`, `createFolder`, `createFile`, etc.
*   There's no global "mode" state. The app assumes it's always in "Workspace Mode".

### How to Implement Mode Selection
1.  **State Management for Mode:**
    *   We need a global state or a hook (e.g., `useAppMode`) that manages:
        *   Current Mode: `null` (show selection), `'simple'`, or `'workspace'`.
        *   Default Mode: Stored in `localStorage` (`app_default_mode`).
2.  **The Selection Screen UI:**
    *   A modal or a full-page overlay shown when `currentMode === null`.
    *   Options for "Simple Mode" and "Workspace Mode".
    *   Descriptions explaining the app's working principle (e.g., "Simple Mode: Hızlıca dosya karşılaştırıp düzenleyin. Veriler kaydedilmez. Workspace Mode: Klasörler oluşturun, dosyalarınızı kaydedin ve yönetin.").
    *   Checkbox: "Her zaman bu modda aç" (Always open in this mode).
3.  **Ephemeral vs Persistent Collections:**
    *   `useCollections.ts` needs to be updated. It currently syncs with `localStorage` (likely under a specific key like `jkir_collections`).
    *   If `mode === 'simple'`, `useCollections` should either use a separate temporary key or bypass `localStorage` entirely (using just React state).
    *   Alternatively, `Simple Mode` can just clear the local state on init and use a purely memory-based array, pre-populated with a default `untitled.json` or `untitled.xml`.
4.  **Header Changes:**
    *   In `app/page.tsx`, the `<header className="app-header">` needs a mode switcher dropdown or button.

## Validation Architecture
*   **Storage Checks:** Does Simple mode leave any traces in `localStorage` related to files? (It shouldn't).
*   **Mode Persisting:** Does checking "Always open in this mode" correctly bypass the selection screen on reload?
*   **Mode Switching:** Does switching from Workspace to Simple mode correctly clear the current view and show the ephemeral state without deleting the user's Workspace files?

## Conclusion for Planner
The planner needs to:
1.  Create a `useAppMode` hook to manage the selection screen and local storage preference.
2.  Update `useCollections` to accept a `mode` parameter (or similar) to toggle `localStorage` persistence and pre-populate a default file in Simple mode.
3.  Create the Selection Screen component (full page or modal).
4.  Modify `app/page.tsx` to conditionally render the selection screen or the main app based on the mode.
5.  Add the mode switcher to the Header in `app/page.tsx`.
