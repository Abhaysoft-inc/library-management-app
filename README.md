
# Library Management App

Full-stack library management system built with a React + Vite client and an Express + MongoDB server. It provides role-based dashboards (Admin, Librarian, Student), book and transaction management, authentication, email notifications, and a small set of utility scripts to seed test users and data.

## Table of contents

- Project overview
- Quick start (development)
- Client (frontend)
- Server (backend)
- Environment variables
- Scripts and utilities
- API overview
- Testing and seeding data
- Contributing
- License

## Project overview

This repository contains two main parts:

- `client/` — React application (Vite) that implements the UI: login/register, role-specific dashboards, book search/listing, book details, profile, and protected routes.
- `server/` — Express API and MongoDB models for Users, Books, Transactions, plus middleware for authentication and utilities for seeding and migrations.

The app supports JSON Web Token (JWT) authentication, role-based access control, and email notifications for events (e.g., overdue books). Some server-side cron or scheduled tasks may exist to handle periodic checks.

## Quick start (development)

Prerequisites:

- Node.js (18+ recommended)
- npm or yarn
- MongoDB (local or connection string)

1. Clone the repository and change into it:

	git clone <repo-url>
	cd library-management-app

2. Install dependencies for both client and server:

	# from repo root
	cd client && npm install
	cd ../server && npm install

3. Start the server and client in separate terminals:

	# start server (dev)
	cd server && npm run dev

	# start client (dev)
	cd client && npm run dev

Open the client URL shown by Vite (usually http://localhost:5173) and the server API at http://localhost:5000 (or the port printed by the server).

## Client (frontend)

Location: `client/`

Main scripts (in `client/package.json`):

- `npm run dev` — start Vite dev server
- `npm run build` — build production assets
- `npm run preview` — preview the built site
- `npm run lint` — run ESLint

Tech highlights:

- React + Vite
- React Router for routing
- Redux Toolkit for state management
- Tailwind CSS for styling

Client configuration and API base URL is usually found in `client/src/services/api.js` — adjust if your server runs on a different host/port.

## Server (backend)

Location: `server/`

Main scripts (in `server/package.json`):

- `npm run start` — start the server (production)
- `npm run dev` — start server with `nodemon` for development

The server exposes REST endpoints for authentication, books, transactions, and user management. Models are in `server/models/` and routes are in `server/routes/`.

Notable files and folders:

- `server/index.js` — application entry point
- `server/middleware/auth.js` — JWT middleware to protect routes
- `server/services/emailService.js` — nodemailer setup used for sending emails
- `server/createTestUsers.js`, `createTestAdmin.js`, etc. — helper scripts to seed test accounts and sample data

## Environment variables

Create a `.env` file in the `server/` directory (or use your environment management) with the following variables (defaults are indicated where present):

- `PORT` — server port (default: 5000)
- `MONGODB_URI` — MongoDB connection string (default used in code: `mongodb://localhost:27017/ee_library`)
- `JWT_SECRET` — secret for signing JWT tokens (no default; required for auth)
- `JWT_EXPIRE` — token expiry (default in code: `7d`)
- `NODE_ENV` — `development` or `production`
- `CLIENT_URL` — URL to the client app used in emails (e.g., `http://localhost:5173`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP settings for email notifications
- `DEFAULT_BORROW_DAYS` — default number of days a book can be borrowed (default: 14)
- `FINE_PER_DAY` — fine charged per overdue day (default: 5)

Example `.env` (do not commit secrets):

	 PORT=5000
	 MONGODB_URI=mongodb://localhost:27017/ee_library
	 JWT_SECRET=change_this_secret
	 JWT_EXPIRE=7d
	 CLIENT_URL=http://localhost:5173
	 SMTP_HOST=smtp.example.com
	 SMTP_PORT=587
	 SMTP_USER=you@example.com
	 SMTP_PASS=supersecret
	 DEFAULT_BORROW_DAYS=14
	 FINE_PER_DAY=5

## Scripts and utilities

Server includes several utility scripts at project root of `server/` such as:

- `createAdmin.js`, `createTestAdmin.js`, `createTestLibrarian.js`, `createTestStudent.js` — helpers to create test users
- `createSampleBooks.js` — seed sample book records
- `migrate.js` — migration helper (if present/used)

Run them with node from the `server` folder. Example:

	 node createTestAdmin.js

Be careful running seed/migration scripts against production databases.

## API overview

The server provides REST endpoints under `/api` (see `server/routes/*`). The main functional areas:

- Auth (`/api/auth`) — login, register, token handling
- Books (`/api/books`) — CRUD operations and search
- Transactions (`/api/transactions`) — borrow/return, fines
- Students/Users (`/api/students`, `/api/users`) — user management (role-restricted)

Authentication is via JWT in an `Authorization: Bearer <token>` header. Protected routes check role claims in the user object.

For full endpoint details, open the route files in `server/routes/` which include validation and expected request/response shapes.

## Testing and seeding data

There are no automated unit tests in the repository by default. You can seed test accounts and books using the provided helpers (e.g., `createTestUsers.js`). Typical workflow:

1. Start MongoDB locally or point `MONGODB_URI` to a test database.
2. Run `node createSampleBooks.js` to populate books.
3. Run `node createTestAdmin.js` / `node createTestLibrarian.js` / `node createTestStudent.js` to create users.

Then login from the client UI and exercise the app flows.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo and create a feature branch.
2. Make changes and add tests if applicable.
3. Open a pull request with a clear description of the changes.

Please follow the existing coding style. Run linters in the `client/` folder with `npm run lint`.

## License

This project does not include an explicit license file. Add a `LICENSE` to clarify reuse rules.

---

If you want, I can also add a short `client/README.md` and `server/README.md` with focused setup instructions and common troubleshooting steps. Would you like that?
