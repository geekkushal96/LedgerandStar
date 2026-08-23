# Store Rating Platform

A full-stack web app where users rate stores (1–5). Three roles: System
Administrator, Normal User, and Store Owner — each with their own
dashboard and permissions.

**Stack:** Express.js · PostgreSQL (via Sequelize) · React · JWT auth


---



## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```
Get PostgreSQL Database connection pooler link from Supabase. Example
```
postgresql://postgres.HOSTNAME:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

Open `.env` and set:

```
DATABASE_URL=paste_your_supabase_link_here

JWT_SECRET=replace_this_with_a_long_random_secret
```

To seed the database run command:
```
node backend/seed/seed.js
```

Start the server:

```bash
npm run dev      # with auto-reload (nodemon)
# or
npm start
```

You should see:
```
Database connection established.
Models synced.
Server running on http://localhost:5000
```

Create the first admin account (reads name/email/password from `.env`,
edit those values first if you want something different):

```bash
npm run seed
```

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env   # points to http://localhost:5000/api by default
npm start
```

The app opens at `http://localhost:3000`.

## 3. Try it out

1. Log in with the seeded admin account (`admin@storerating.com` /
   `Admin@1234` unless you changed `.env` before seeding).
2. As admin: create a **Store Owner** user, then create a **Store** and
   link it to that owner.
3. Sign up a new **Normal User** account from the login page, browse
   stores, and submit a rating.
4. Log back in as the store owner to see the rating and average on
   their dashboard.
5. As admin, check the dashboard totals and try the filters/sorting on
   the Stores and Users tables.

---

## Roles & permissions

| Role | Capabilities |
|---|---|
| **System Administrator** | Add users (any role) and stores; view platform-wide dashboard (user/store/rating counts); view & filter/sort store and user listings; view user detail (including a store owner's rating) |
| **Normal User** | Sign up, log in, update password; browse/search stores by name & address; submit and modify a 1–5 rating per store |
| **Store Owner** | Log in, update password; view a dashboard listing everyone who rated their store and the store's average rating |

## Validation rules (enforced on both frontend and backend)

- **Name:** 20–60 characters
- **Address:** up to 400 characters
- **Password:** 8–16 characters, at least one uppercase letter and one special character
- **Email:** standard email format

## Database schema

- **users** — id, name, email (unique), password (bcrypt hash), address, role (`admin` \| `user` \| `store_owner`), timestamps
- **stores** — id, name, email (unique), address, owner_id (nullable FK → users), timestamps
- **ratings** — id, user_id (FK → users), store_id (FK → stores), rating (1–5), timestamps; unique constraint on (user_id, store_id) so each user has exactly one rating per store, which is updated (not duplicated) on re-submission

## API overview

All protected routes require `Authorization: Bearer <token>`.

**Auth**
- `POST /api/auth/signup` — normal-user self-registration
- `POST /api/auth/login`
- `PUT /api/auth/update-password` (protected)
- `GET /api/auth/me` (protected)

**Admin** (role: admin)
- `GET /api/admin/dashboard`
- `POST /api/admin/users` — create user of any role
- `POST /api/admin/stores`
- `GET /api/admin/stores?name=&email=&address=&sortBy=&order=`
- `GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=`
- `GET /api/admin/users/:id`

**Normal user** (role: user)
- `GET /api/stores?name=&address=` — includes overall rating and the caller's own rating
- `POST /api/stores/:id/rating` — submit or update a rating (`{ "rating": 1-5 }`)

**Store owner** (role: store_owner)
- `GET /api/store-owner/dashboard` — raters list + average rating

## Project structure

```
store-rating-app/
├── backend/
│   ├── config/db.js          # Sequelize connection
│   ├── models/                # User, Store, Rating + associations
│   ├── controllers/           # Route logic
│   ├── routes/                # Express routers
│   ├── middleware/            # JWT auth, role check, validation
│   ├── utils/                 # Shared validators, token generator
│   ├── seed/seed.js           # Creates first admin account
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js       # Axios instance with auth interceptor
        ├── context/AuthContext.js
        ├── components/        # Layout, ProtectedRoute, RatingSeal, StarInput, SortableHeader
        ├── pages/              # Login, Signup, dashboards per role, etc.
        └── App.js              # Route definitions
```

