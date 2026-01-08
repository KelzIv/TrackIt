# TrackIt - Media Tracking App

A full-stack media tracking application built with **React**, **Node.js/Express**, **PostgreSQL**, and **JWT authentication**. Track movies, TV shows, ratings, and notes with a clean, responsive interface.

[

## ✨ Features

- ✅ User registration & login with JWT authentication
- ✅ Add, edit, delete media items (Movies/TV Shows)
- ✅ Track status (To Watch/Watching/Watched), ratings (0-5), and notes
- ✅ Responsive design works on mobile & desktop
- ✅ Protected routes - requires login to access media tracker
- ✅ Deploy-ready for Render/any Node.js host

## 🏗️ Tech Stack

| Frontend | Backend | Database | Auth | Deployment |
|----------|---------|----------|------|------------|
| React | Node.js/Express | PostgreSQL | JWT + bcrypt | Render |

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/trackit.git
cd trackit
npm install
```

### 2. Database Setup
Create a `users` table:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  rating DECIMAL(2,1),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Environment Variables
Create `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/trackit
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
```

### 4. Run Development
```bash
# Backend + Frontend build
npm run dev
# or separately:
npm run build  # Build React
npm start      # Start Express server
```

Visit `http://localhost:5000`

## 🌐 Production Deployment (Render)

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

### 2. Render Setup
- **Web Service** → Connect your GitHub repo
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`
- **Environment Variables**:
  ```
  DATABASE_URL=postgresql://... (Supabase/Neon/Render Postgres)
  JWT_SECRET=your-secret-here
  PORT=10000 (Render auto-assigns)
  ```

## 📁 Project Structure

```
trackit/
├── Backend/           # Express server (server.js)
├── Frontend/          # React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth.jsx
│   │   │   └── MediaTracker.jsx
│   │   ├── services/api.js
│   │   └── App.js
├── build/             # Generated React build
├── .env               # Environment vars
└── package.json
```

## 🔧 Key Configuration

### Server Route Order (Critical!)
```js
// 1. API routes first
app.post('/register'), app.post('/login'), app.post('/media'), etc.

// 2. Static files
app.use(express.static('build'));

// 3. React catch-all (handles /login, /app, etc.)
app.get('/*', (req, res) => res.sendFile('build/index.html'));

// 4. 404 last
app.use((req, res) => res.status(404).send('Not found'));
```

### Logout Flow
1. `MediaTracker.handleLogout()` → `setToken("")` + clear localStorage
2. `App.js` sees `!token` → renders `<Auth />` login page
3.  Clean state-based navigation, no routing needed

##  API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | - | Create user |
| `POST` | `/login` | - | Get JWT token |
| `POST` | `/logout` | ✓ | Client logout |
| `GET` | `/media` | ✓ | List user media |
| `POST` | `/media` | ✓ | Add media |
| `PUT` | `/media/:id` | ✓ | Update media |
| `DELETE` | `/media/:id` | ✓ | Delete media |

##  Styling
- CSS modules + utility classes in `mediaTracker.css`
- Responsive grid layout
- Dark mode ready (add `prefers-color-scheme` media query)

## 📄 License
MIT - Free to use and modify!

## 🙏 Acknowledgments
- [React](https://react.dev) - Frontend framework
- [Express](https://expressjs.com) - Backend server
- [Supabase](https://supabase.com) - PostgreSQL hosting
- [Render](https://render.com) - Deployment platform

***
