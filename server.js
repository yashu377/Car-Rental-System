require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// ─── Database Connection ─────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Yash@377',
  database: 'car_rental',
});

// ─── Auth Middleware ─────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role === 'admin' ? 'admin' : 'user']
    );
    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Cars Routes ─────────────────────────────────────────────────────────────
app.get('/api/cars', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cars ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cars/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Car not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cars', authenticate, adminOnly, async (req, res) => {
  const { brand, model, year, color, price_per_day, fuel_type, transmission, seats, image_url, description } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO cars (brand, model, year, color, price_per_day, fuel_type, transmission, seats, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, year, color, price_per_day, fuel_type, transmission, seats, image_url, description]
    );
    res.status(201).json({ message: 'Car added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cars/:id', authenticate, adminOnly, async (req, res) => {
  const { brand, model, year, color, price_per_day, fuel_type, transmission, seats, image_url, description, status } = req.body;
  try {
    await pool.execute(
      'UPDATE cars SET brand=?, model=?, year=?, color=?, price_per_day=?, fuel_type=?, transmission=?, seats=?, image_url=?, description=?, status=? WHERE id=?',
      [brand, model, year, color, price_per_day, fuel_type, transmission, seats, image_url, description, status, req.params.id]
    );
    res.json({ message: 'Car updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cars/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await pool.execute('DELETE FROM cars WHERE id = ?', [req.params.id]);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Bookings Routes ─────────────────────────────────────────────────────────
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `SELECT b.*, u.name as user_name, u.email as user_email, c.brand, c.model
               FROM bookings b JOIN users u ON b.user_id = u.id JOIN cars c ON b.car_id = c.id ORDER BY b.created_at DESC`;
      params = [];
    } else {
      query = `SELECT b.*, c.brand, c.model, c.image_url
               FROM bookings b JOIN cars c ON b.car_id = c.id WHERE b.user_id = ? ORDER BY b.created_at DESC`;
      params = [req.user.id];
    }
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', authenticate, async (req, res) => {
  const { car_id, start_date, end_date } = req.body;
  try {
    const [cars] = await pool.execute('SELECT * FROM cars WHERE id = ? AND status = "available"', [car_id]);
    if (!cars.length) return res.status(400).json({ error: 'Car not available' });
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    if (days < 1) return res.status(400).json({ error: 'Invalid dates' });
    const total = days * cars[0].price_per_day;
    const [result] = await pool.execute(
      'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, car_id, start_date, end_date, total]
    );
    await pool.execute('UPDATE cars SET status = "booked" WHERE id = ?', [car_id]);
    res.status(201).json({ message: 'Booking created', id: result.insertId, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', authenticate, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!bookings.length) return res.status(404).json({ error: 'Booking not found' });
    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    if (status === 'cancelled' || status === 'completed') {
      await pool.execute('UPDATE cars SET status = "available" WHERE id = ?', [bookings[0].car_id]);
    }
    res.json({ message: 'Booking updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Users Routes (Admin) ─────────────────────────────────────────────────────
app.get('/api/users', authenticate, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
app.get('/api/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const [[{ total_cars }]] = await pool.execute('SELECT COUNT(*) as total_cars FROM cars');
    const [[{ available_cars }]] = await pool.execute('SELECT COUNT(*) as available_cars FROM cars WHERE status = "available"');
    const [[{ total_users }]] = await pool.execute('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
    const [[{ total_bookings }]] = await pool.execute('SELECT COUNT(*) as total_bookings FROM bookings');
    const [[{ total_revenue }]] = await pool.execute('SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE status = "confirmed"');
    res.json({ total_cars, available_cars, total_users, total_bookings, total_revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚗 Car Rental API running on port ${PORT}`));
