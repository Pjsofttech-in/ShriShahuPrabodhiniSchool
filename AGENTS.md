# Agent Guidance

## Project Checks

- Install dependencies with `npm install`.
- Run the app with `npm run dev` and verify production builds with `npm run build`.
- `npm run preview` serves the production build. There are currently no test or lint scripts in `package.json`.
- See [README.md](README.md) for the project overview and setup notes. Verify details against current source when the README and implementation differ.

## Architecture

- `src/App.jsx` defines routes. Shared page chrome lives in `src/components/Layout.jsx`; role-gated routes use `src/components/ProtectedRoute.jsx`.
- Public pages are in `src/pages/`; dashboards are in `src/pages/dashboards/`; Sankalp exam flows are in `src/pages/sankalp/`.
- `src/services/backendService.js` owns backend operations and response normalization. `src/utils/api.js` configures the Axios client and authentication. Reuse these boundaries instead of adding ad hoc HTTP calls in page components.
- Shared login state and session persistence live in `src/context/AuthContext.jsx`. Static site content and supporting records live in `src/data/`.
- Styling uses React, Tailwind CSS utilities, and shared tokens/components in `src/index.css`. Preserve existing visual conventions and shared classes such as `card`, `btn-primary`, and `input-field`.

## Implementation Rules

- Keep changes scoped to the owning page, component, service, or data module. Check nearby implementations before introducing a new pattern.
- For API-backed UI, handle loading, empty, and error states, and normalize response shapes in the service layer where practical.
- Keep payment order creation and signature verification on the backend. The browser may use a Razorpay Key ID; never expose a Key Secret or other server credential in frontend code or `VITE_` variables.
- Do not print or commit environment-file values. Use the existing environment configuration and API helpers.
- Do not assume the README's older description of dummy data reflects current runtime behavior; inspect the relevant source before changing authentication or persistence.