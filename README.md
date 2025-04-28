```markdown
# Organizer

A full-stack task organizer application with user authentication, task management, and push notifications.

---

## Features

- **User Authentication**  
  Register, log in, log out via Passport.js and express-session.

- **Task Management**  
  Create, read, update, delete your tasks through a RESTful API.

- **Push Notifications**  
  Subscribe to browser notifications; scheduled reminders are dispatched via Web Push and a cron scheduler.

- **Cookie Management**  
  Includes an endpoint to clear session cookies on demand.

- **Responsive Front-end**  
  Modern React interface styled with Tailwind CSS; works across desktop and mobile.

---

## Tech Stack

- **Frontend**  
  - React (Create React App)  
  - Tailwind CSS  
  - Axios for HTTP requests

- **Backend**  
  - Node.js & Express.js  
  - MongoDB & Mongoose  
  - Passport.js (passport-local strategy)  
  - express-session & connect-flash  
  - CORS  
  - cron & node-cron  
  - web-push for notifications

- **Utilities**  
  - dotenv for environment variables  
  - bcryptjs for password hashing  

---

## Prerequisites

- **Node.js** (v14 or above)  
- **npm**  
- **MongoDB** instance (local or hosted)  
- **VAPID keys** for Web Push (generate with `web-push generate-vapid-keys`)

---

## Getting Started

1. **Clone the repository**  
   ```bash
   git clone https://github.com/PratibhaK11/Organizer.git
   cd Organizer
   ```

2. **Set up environment variables**  
   In `server/`, create a `.env` file with:
   ```
   MONGO_URI=your_mongo_connection_string
   SESSION_SECRET=your_session_secret
   CORS_ORIGIN=http://localhost:3000
   PORT=5000
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

3. **Install dependencies**  
   ```bash
   # Root (axios for client <-> server calls)
   npm install

   # Server
   cd server
   npm install

   # Front-end
   cd ../organizer-app
   npm install
   ```

4. **Run the application**  
   ```bash
   # In one terminal: start the server
   cd Organizer/server
   npm start

   # In another terminal: start the React app
   cd Organizer/organizer-app
   npm start
   ```

   - Server will run on `http://localhost:5000`  
   - Front-end on `http://localhost:3000`

5. **Build for production**  
   ```bash
   cd Organizer/organizer-app
   npm run build

   cd ../server
   npm start
   ```

   The Express server will serve the optimized React build.

---

## Project Structure

```
Organizer/
├── organizer-app/      # React front-end (CRA + Tailwind)
│   ├── public/
│   └── src/
├── server/             # Express back-end
│   ├── config/         # Passport, VAPID, other configs
│   ├── controllers/    # Business logic
│   ├── cron/           # Scheduled jobs
│   ├── models/         # Mongoose schemas
│   └── routes/         # Express routers
├── package.json        # Root: axios dependency
└── README.md           # You are here
```

---

## Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes (`git commit -m "Add YourFeature"`)  
4. Push to the branch (`git push origin feature/YourFeature`)  
5. Open a Pull Request  

## License

This project is licensed under the MIT License.