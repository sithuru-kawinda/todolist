# Sprint Retrospectives

### Sprint 6 retro — 2026-05-04

- Went well: Core CRUD/auth/filter/dark-mode/toast/keyboard features were fully implemented before the sprint session. `useTheme`, `ToastContext`, `Navbar` toggle, anti-FOUC script in `index.html` were all correct.
- Didn't go well: Sprint file was never kept in sync with actual code — all 30 boxes were still unchecked despite most work being done. Also, a loading-state bug in `AuthContext.me()` (missing `.catch()`) went undetected — would have caused ProtectedRoute to hang after SPA login.
- Try next sprint: Update sprint file checkboxes at each commit, not in a batch at the end. Add a `me()` error path test to catch the loading-stuck scenario earlier.

### Sprint 6 polish retro — 2026-05-04 (T-087 + T-090)

- Went well: Touch target audit was systematic — found 4 components with sub-44px interactive elements (toggle button at h-5 w-5, edit/delete at h-9, dark mode toggles at h-9 w-9, filter tabs and logout at py-1.5). All fixed in a single pass. A11y fixes were high-confidence static analysis: progressbar role, ARIA group over incomplete tab pattern, and contrast ratios (gray-500/gray-400 on gray-100 ≈ 3.9:1 → gray-600 ≈ 5.9:1).
- Didn't go well: Lighthouse score itself can only be verified manually in a running browser — the DoD item has a partial gap. Frontend `npm run lint` has a pre-existing missing ESLint config file (separate from my changes).
- Try next sprint: Record Lighthouse scores after running `npm run dev` + Lighthouse audit and add them to `velocity_tracking.md` before closing Sprint 6 fully.
