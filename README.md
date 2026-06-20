# Student Result Management

Student Result Management is a full-stack web application for managing and viewing student academic results. It is split across two repositories: a React frontend and a Node.js/Express backend backed by MongoDB.

| Layer | Repository | Stack | Live URL |
|---|---|---|---|
| Frontend | [Student-Result-Management](https://github.com/Oscarv2005/Student-Result-Management) | React + Vite | [student-result-management-pi.vercel.app](https://student-result-management-pi.vercel.app/) |
| Backend | [Stude-Back](https://github.com/Oscarv2005/Stude-Back) | Node.js + Express + MongoDB | [stude-back-sigma.vercel.app](https://stude-back-sigma.vercel.app/) |

## How it fits together

```
User → Student-Result-Management (React UI)
            │
            ▼
       Stude-Back (Express API)
            │  JWT auth, bcrypt password hashing
            ▼
        MongoDB (Mongoose models)
            │
            ▼
   Student records & results → back → front → User
```

- **Student-Result-Management** is the frontend where users (e.g. students/admins) log in and view or manage student results.
- **Stude-Back** is the REST API that handles authentication (JWT + bcrypt) and persists data to MongoDB via Mongoose, exposing endpoints the frontend consumes.

## Repositories

### 🖥️ [Student-Result-Management](https://github.com/Oscarv2005/Student-Result-Management)
React + Vite frontend.
- `src/` – application source code
- `public/` – static assets
- Key dependencies: `react`, `react-dom`, Vite tooling
- Deployed on Vercel

### ⚙️ [Stude-Back](https://github.com/Oscarv2005/Stude-Back)
Node.js / Express backend with MongoDB persistence and JWT-based authentication.
- `server.js` – Express server entry point
- Key dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `nodemon`
- Deployed on Vercel via `vercel.json`

## Getting started locally

Clone both repositories:

```bash
git clone https://github.com/Oscarv2005/Student-Result-Management.git
git clone https://github.com/Oscarv2005/Stude-Back.git
```

**1. Backend (Stude-Back)**
```bash
cd Stude-Back
npm install
```
Create a `.env` file with your MongoDB connection string and JWT secret, e.g.:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
Then start the server:
```bash
npx nodemon server.js
```

**2. Frontend (Student-Result-Management)**
```bash
cd Student-Result-Management
npm install
npm run dev
```

> Make sure the frontend points to the backend's API URL (e.g. via an `.env` variable or a config file) so requests reach the Express server correctly.

## Author

Created by [Oscarv2005](https://github.com/Oscarv2005).
