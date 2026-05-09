# Store Task

A small React web store with role-based access control. Built as a course project demonstrating components, routing, forms, hooks, REST API consumption, and Git/GitHub workflow.

The application has three user roles:

- **Master administrator** - the first registered user becomes master automatically. Can create and delete administrator accounts and delete client accounts.
- **Administrator** (power user) - created by the master. Can manage items in the store and approve or reject client baskets.
- **Client** - self-registers. Can browse the store, build a basket, and submit it for approval. Can edit personal profile data.

## Project structure

```
store_task/
├── client/                     React frontend (Vite)
│   ├── src/
│   │   ├── api/                fetch wrappers for REST calls
│   │   ├── auth/               AuthContext, ProtectedRoute, JWT helpers
│   │   ├── components/         reusable UI components (Navbar, ItemCard)
│   │   ├── pages/              one component per route
│   │   │   └── admin/          admin and master pages
│   │   └── styles/             CSS modules
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          dev proxy: /api -> localhost:3001
├── server/                     REST backend (json-server + json-server-auth)
│   ├── server.js               middleware setup and role guards
│   ├── routes.json             access control rules
│   ├── db.seed.json            canonical seed data (committed)
│   ├── db.json                 runtime database (gitignored)
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js 18 or newer** - https://nodejs.org/ (LTS is fine)
- A terminal (PowerShell or Command Prompt on Windows, any shell on Linux/macOS)

## Setup (one-time)

Open two terminals.

### Terminal 1 - server

```
cd server
npm install
npm run seed
```

`npm run seed` creates `server/db.json` from `server/db.seed.json`. Re-run it any time you want to wipe the data and start fresh (for example, before a clean demo).

### Terminal 2 - client

```
cd client
npm install
```

## Running

### Terminal 1 - start the API on port 3001

```
cd server
npm start
```

You should see: `Store API listening on http://localhost:3001`

### Terminal 2 - start the dev server on port 5173

```
cd client
npm run dev
```

Open http://localhost:5173 in a browser.

The Vite dev server proxies `/api/*` requests to the API on port 3001, so you only ever visit one URL.

## Demo flow

1. Open http://localhost:5173. You will be redirected to the login page.
2. Click **Register**. The page detects there is no master administrator and shows a banner. Fill in the form and submit. You are now logged in as the master administrator.
3. Use the **Users** menu to create a new administrator (power user). Provide an email and password.
4. Logout. Login again as the new administrator.
5. Use the **Items** menu to add a few items to the store.
6. Logout. Open the registration page in a private window and create a regular client account (the master banner is gone now).
7. As the client, browse the **Store**, click "Add to basket" on a few items, then open **Basket** and click "Submit basket for approval".
8. Logout, login as administrator. Open **Baskets** to see the submitted basket. Approve or reject with a note.
9. Logout, login as the client again. The basket history shows the decision.

## Architecture notes

### Authentication

- `json-server-auth` issues JWT tokens on `/login` and `/register`. Passwords are stored as bcrypt hashes and never returned to the client.
- The token is kept in `localStorage` and attached to API calls by the `api()` wrapper in [client/src/api/client.js](client/src/api/client.js).
- The frontend decodes the JWT payload (without verifying the signature) to read `id`, `email`, and `role` for the UI in [client/src/auth/jwt.js](client/src/auth/jwt.js). The server still enforces auth on every request.

### Role enforcement

- Frontend role gates (in [client/src/auth/ProtectedRoute.jsx](client/src/auth/ProtectedRoute.jsx)) hide pages that the current role should not see. They are a UX layer, not a security boundary.
- Server-side role guards live in [server/server.js](server/server.js). They decode the JWT and reject:
  - non-administrator writes to `/items`
  - non-administrator status changes on `/baskets/:id`
  - registration with `role: master` when a master already exists
  - registration with `role: power` from a non-master caller
  - `DELETE /users/:id` from a non-master caller

### Access control rules

[server/routes.json](server/routes.json) sets json-server-auth permissions per resource:

- `/users` - 640 (admin rw, owner rw, public read) - public read lets the registration page detect whether a master exists
- `/items` - 644 (admin rw, owner rw, public read) - clients need to browse
- `/baskets` - 660 (admin rw, owner rw, no public access) - administrators read all baskets via a small bypass in the middleware

### First-user-is-master bootstrap

[client/src/pages/RegisterPage.jsx](client/src/pages/RegisterPage.jsx) calls `GET /users?role=master&_limit=1` on mount. If the result is empty, it shows a banner and submits the registration with `role: master`. If a master exists, it submits with `role: client`. The server's middleware also enforces this on the backend, so a forged request cannot create a second master.

## Known limitations

- Prices are not snapshotted onto basket lines. If an administrator changes an item price between basket creation and approval, the basket reflects the new price. Production would snapshot price at add-to-basket time.
- "One draft basket per user" is frontend-enforced. Two browser tabs can race and create two drafts.
- JWTs expire after one hour (json-server-auth default). After expiry, an API call returns 401 and the user is redirected to the login page.
- No production build step is configured for serving the static files separately. CORS would need to be revisited if you deploy that way.
- JWT signature is not verified on the server. The role claim is read from the decoded payload, which is sufficient for a coursework demo. Production would share a `JWT_SECRET` between json-server-auth and the role middleware and use `jwt.verify`.

## Reset the database

If you need to start over with fresh data:

```
cd server
npm run seed
```

This overwrites `db.json` with the contents of `db.seed.json`. The seed file ships with four sample items and zero users, so the master bootstrap path triggers immediately.
