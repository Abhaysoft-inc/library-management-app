# Library Management App

A full-stack library management system built with React (Vite) as the frontend and Express + MongoDB as the backend. The app implements role-based access (Admin, Librarian, Student), book catalog and transaction management (borrow/return), JWT authentication, and email notifications.

## Contents

- `client/` — React + Vite frontend
- `server/` — Express API and MongoDB models

## Quick start

Prerequisites:

- Node.js 18+ and npm
- MongoDB (local or a connection string)

1. Install dependencies:

```bash
cd client && npm install
cd ../server && npm install
```

2. Create a `.env` file in `server/` (see Environment variables section).

3. Start services in separate terminals:

```bash
# server (development)
cd server && npm run dev

# client (development)
cd client && npm run dev
```

The client usually runs on http://localhost:5173 and the server on http://localhost:5000.

## Environment variables (server)

Add a `.env` file to `server/` with the following keys (examples):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ee_library
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=supersecret
DEFAULT_BORROW_DAYS=14
FINE_PER_DAY=5
```

Important: Do not commit secrets to version control.

## Client (frontend)

Location: `client/`

Useful scripts (from `client/package.json`):

- `npm run dev` — run Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

Main tech: React, React Router, Redux Toolkit, Tailwind CSS.

API calls are made from `client/src/services/api.js` — update the base URL there if the server runs elsewhere.

## Server (backend)

Location: `server/`

Useful scripts (from `server/package.json`):

- `npm run dev` — run server with nodemon (development)
- `npm run start` — run server with node (production)

Key folders:

- `server/models/` — Mongoose models: User, Book, Transaction, Category
- `server/routes/` — Express route handlers for auth, books, transactions, migrations
- `server/middleware/` — auth middleware (JWT verification)
- `server/services/` — email and notification utilities

## Seeding & utilities

Server contains helper scripts to create test users and sample books (e.g., `createTestAdmin.js`, `createSampleBooks.js`). Run them from the `server/` folder:

```bash
node createSampleBooks.js
node createTestAdmin.js
```

Be careful not to run seed scripts against production databases.

## API overview

- `POST /api/auth/login` — authenticate and receive JWT
- `POST /api/auth/register` — register new user
- `GET /api/books` — list/search books
- `GET /api/books/:id` — book details
- `POST /api/transactions/borrow` — borrow a book (protected)
- `POST /api/transactions/return` — return a book (protected)

Check the detailed route files in `server/routes/` for validation rules and full request/response shapes.

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes and run linters/tests
3. Open a pull request with a clear description

## License

Add a `LICENSE` file to specify the project's license.

---

If you'd like, I can:

- Add `client/README.md` and `server/README.md` with focused instructions and examples.
- Create a `server/.env.example` file with the recommended environment variables.

