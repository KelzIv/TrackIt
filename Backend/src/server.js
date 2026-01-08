// server.js (CommonJS)
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path  = require('path');

dotenv.config();

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log('DB connected at', new Date());
    client.release();
  })
  .catch(err => console.error('DB connection error:', err.stack));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

const port = process.env.PORT || 5000;


app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user into database
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // unique constraint violation
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Look up user by username
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // token valid for 1 hour
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // attach user info to request
    next();
  });
}

// CREATE media item
app.post('/media', authenticateToken, async (req, res) => {
  const { title, media_type, status, rating, notes } = req.body;
  const user_id = req.user.userId;

  if (!title || !media_type || !status) {
    return res.status(400).json({ error: 'Title, media_type, and status are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO media (user_id, title, media_type, status, rating, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, title, media_type, status, rating || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// READ all media for logged-in user
app.get('/media', authenticateToken, async (req, res) => {
  const user_id = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM media WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/media/:id', authenticateToken, async (req, res) => {
  const mediaId = req.params.id;
  const userId = req.user.userId;
  const { title, media_type, status, rating, notes } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE media
      SET
        title = COALESCE($1, title),
        media_type = COALESCE($2, media_type),
        status = COALESCE($3, status),
        rating = COALESCE($4, rating),
        notes = COALESCE($5, notes)
      WHERE id = $6 AND user_id = $7
      RETURNING *
      `,
      [title, media_type, status, rating, notes, mediaId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/media/:id', authenticateToken, async (req, res) => {
  const mediaId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'DELETE FROM media WHERE id = $1 AND user_id = $2',
      [mediaId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ message: 'Media deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/logout', (req, res) => {
  // With JWTs, logout is handled on the client
  res.status(200).json({ message: 'Logged out successfully' });
});


app.get('/', (req, res) => {
  res.send('TrackIt backend is running!');
});

app.use((req, res) => {
  res.status(404).send('Route not found');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.use(express.static(path.join(__dirname, 'build')));

// Serve React app for all unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
