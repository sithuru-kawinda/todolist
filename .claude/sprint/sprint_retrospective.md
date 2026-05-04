# Sprint Retrospectives

### Sprint 6 retro — 2026-05-04
- Went well: Core CRUD/auth/filter/dark-mode/toast/keyboard features were fully implemented before the sprint session. `useTheme`, `ToastContext`, `Navbar` toggle, anti-FOUC script in `index.html` were all correct.
- Didn't go well: Sprint file was never kept in sync with actual code — all 30 boxes were still unchecked despite most work being done. Also, a loading-state bug in `AuthContext.me()` (missing `.catch()`) went undetected — would have caused ProtectedRoute to hang after SPA login.
- Try next sprint: Update sprint file checkboxes at each commit, not in a batch at the end. Add a `me()` error path test to catch the loading-stuck scenario earlier.
