# TODO: Fix Clauses Display for Full Information with Expand/Collapse

## Tasks
- [x] Update backend (src/Backend/main.py) to extract longer clause snippets (1000 characters instead of 200)
- [x] Update frontend (src/pages/Clauses.tsx) to add expand/collapse functionality with smooth transitions
  - [x] Import Collapsible components
  - [x] Add state for tracking expanded clauses
  - [x] Modify CardContent to show truncated preview and expand button
  - [x] Implement Collapsible for full content with transitions
- [x] Test the clauses page to ensure full content is accessible and transitions are smooth

## Notes
- Backend change: Increase snippet length to 1000 characters to reduce truncation.
- Frontend: Use Collapsible component for dropdown effect on click, add transitions for attractiveness.
- Backend and frontend are running; user can test the expand/collapse functionality.
