# Blood Test Booking System

A full-stack web application for booking blood tests online with a React frontend and Express backend.

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/blood-test-booking.git
   cd blood-test-booking
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file in the server directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update `JWT_SECRET` with a secure random string.

3. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   ```

4. **Run the Application:**
   
   In one terminal (backend):
   ```bash
   cd server
   npm run dev
   ```
   
   In another terminal (frontend):
   ```bash
   cd client
   npm start
   ```
   
   - Backend runs on: http://localhost:5000
   - Frontend runs on: http://localhost:3000

## Project Overview

This README summarizes what has been implemented in the local prototype and how to run it. Use this to feed another AI or developer for further improvements.

## High level status
- Backend (Express) scaffold created with in-memory storage (no DB).
  - package.json updated (server).
  - Added server entrypoint exposing a root GET / (prevents 404) and attempts to mount API route modules.
  - Implemented modules for: data seed, auth routes, tests routes, bookings routes, and auth middleware that uses a simple token scheme.
  - Data is stored in plain JavaScript arrays; restarting the server resets data.
- Frontend (React) scaffold produced (client).
  - React 18 functional components using React Router and Context API.
  - Pages/components created: Home, Tests, TestDetails, Booking (multi-step wizard), Login/Register, MyBookings, Admin.
  - Client package.json uses react-scripts for local development.
  - Axios wrapper configured to point at backend API at http://localhost:5000/api.

## Authentication & Session Management
- **Session Duration**: 30 minutes from login (fixed expiry, no sliding renewal)
- **Token Storage**: JWT-like token stored in localStorage on client, Authorization header sent with each request
- **Token Validation**: Server middleware checks token existence and expiry; if token expired or invalid, returns 401
- **Client-Side Handling**: Global axios response interceptor catches 401 errors, clears localStorage, and redirects to /login
- **Complexity Removed**: No longer attempting to extend sessions on each request or track expiry with timers on client
- **Why This Approach**: Simpler, more robust, and matches how major websites handle sessions

## Files created or updated (summary)
- server/
  - package.json (updated)
  - index.js (main server entry with root route and conditional mounting of /api routes)
  - data.js (seed arrays: tests, users, bookings) — seeded with sample tests and an admin user
  - middleware/auth.js (simple token middleware, requireAuth, requireAdmin; validates token expiry only)
  - routes/auth.js (POST /api/auth/register, POST /api/auth/login; both return token valid for 30 minutes)
  - routes/tests.js (GET/POST/PUT/DELETE /api/tests — admin for create/update/delete)
  - routes/bookings.js (GET/POST bookings, admin update status, user cancel)
- client/
  - package.json (uses react-scripts for dev)
  - src/
    - index.js, App.js
    - context/AuthContext.js (stores user + token, provides login/register/logout; sets axios Authorization header on token change)
    - context/BookingContext.js (manages booking state: tests, patient, address, payment)
    - services/api.js (axios instance with 401 interceptor that clears auth and redirects to /login)
    - pages: Home, Tests, TestDetails, Booking, Login, Register, MyBookings, Admin
    - components: Header, Footer, TestCard, FormInput, HomeBanners
    - index.css (responsive medical theme with teal primary color)

## Run locally (recommended)
1. Backend
   - cd d:\thyrosoftwebsite\blood-test-booking\server
   - npm install
   - npm run dev   # uses nodemon, or `npm start` to run once
   - Server runs: http://localhost:5000
   - Root (GET /) responds with a small HTML page; API under /api/

2. Frontend (development)
   - cd d:\thyrosoftwebsite\blood-test-booking\client
   - npm install
   - npm start
   - App runs at: http://localhost:3000 (react-scripts dev server)

3. Production-style preview
   - cd client
   - npm run build
   - npm run serve

## Default credentials & seeds
- Admin user (seeded):
  - email: admin@lab.com
  - password: Admin@123
  - role: admin
- Several sample tests are seeded (CBC, Lipid Profile, Thyroid, Vitamin D, etc.)
- Example bookings may be included as sample data.

## Troubleshooting — Console errors you saw and how to fix them
Below are the specific console/network errors you pasted and concise actions to resolve them.

1) GET /api/bookings 401 (Unauthorized)
  - Log in on the frontend (Register or Login) to obtain a token. AuthContext stores token in localStorage and setAuthToken sets axios header.
  - For admin actions, log in as admin@lab.com / Admin@123. After login, requests to /api/bookings will include the token.
  curl -s -H "Content-Type: application/json" -X POST http://localhost:5000/api/auth/login -d '{"email":"admin@lab.com","password":"Admin@123"}'
  - Use the returned token: export TOKEN=<token>; curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/bookings

2) GET /api/banners 404 (Not Found)
  - Quick client fix: The client already includes a getBanners helper that falls back to a small mock array when the endpoint 404s. No action required unless you want to remove console noise.
  - Server fix: Implement a simple /api/banners route returning JSON (see optional server snippet below). Implementing it will eliminate the 404s and let you manage banners from the backend.

3) Admin.js: AxiosError and POST /api/banners 404
  - Update Admin UI to avoid POSTing banners until backend supports it.
  - Or add a banners route to server to accept POST/GET. See snippet below to add a basic banners router.

4) React Router deprecation/future warnings

5) General tips

Note about server restarts and tokens
- If you restart the backend during development, any existing tokens stored on the server in memory will be lost. Clients that still have a token in `localStorage` will receive 401 Unauthorized until the user logs in again. If you see repeated 401s after a server restart, re-login using the Login page.
 
Client behavior on 401 responses
- The frontend now includes a global handler for 401 responses. When the server returns 401 Unauthorized the client will clear stored auth (token/user) and redirect to `/login` so the user can re-authenticate. This prevents repeated failed requests when the server-side token store was reset (e.g., after a server restart).

Session timeout details
- Sessions are valid for 15 minutes from login/registration. The server sets a `tokenExpires` timestamp when issuing a token. The client stores this and will automatically log out and redirect to `/login` once the 15 minutes elapse.
- Note: tokens are stored only in server memory; restarting the backend will invalidate active tokens and require users to re-login.
 - Sessions are valid for 15 minutes from login/registration. The server sets a `tokenExpires` timestamp when issuing a token. The client stores this and will automatically log out and redirect to `/login` once the 15 minutes elapse.
 - Sliding session: active authenticated requests now extend the session expiry by another 15 minutes (server updates `tokenExpires` and returns it in the `x-token-expires` response header). The client updates its local timer when it sees that header so active users won't be logged out mid-flow.
## Optional minimal server snippets (copy into server files) 
If you prefer to implement banners on the backend, add a small route file and mount it. This is optional.

- Example simple banners router (create server/routes/banners.js):

```javascript
// filepath: d:\thyrosoftwebsite\blood-test-booking\server\routes/banners.js
const express = require('express');
const router = express.Router();
let banners = [
  { id:1, title:'Home Sample Collection', subtitle:'We collect samples at your home', img:'/assets/banner1.svg' },
  { id:2, title:'Fast Reports', subtitle:'View results online quickly', img:'/assets/banner2.svg' }
];

router.get('/', (req,res) => res.json(banners));
router.post('/', (req,res) => {
  const b = { id: banners.length+1, ...req.body };
  banners.push(b);
  res.status(201).json(b);
});
module.exports = router;
```

- Mount it in server/index.js (near other route mounts):

```javascript
// filepath: d:\thyrosoftwebsite\blood-test-booking\server\index.js
// ...existing code...
try {
  const bannersRoutes = require('./routes/banners'); // new
  app.use('/api/banners', bannersRoutes);
} catch (err) {
  // ignore if not created
}
```

## Quick action checklist
- To remove 401 when testing bookings: login first (frontend) or use curl with token.
- To eliminate banners 404: either leave the getBanners fallback (already present) or implement the server banners route above.
- To prevent Admin POST errors: implement banners route or modify Admin to skip banner POSTs.

## Next steps for another AI/developer
- Decide whether banners should be server-managed or frontend-only; implement accordingly.
- Add clearer error handling/UI feedback where network calls fail (e.g., show toast when banners fetch fails).
- Harden auth flows (use JWT, password hashing) and add persistence as needed.
