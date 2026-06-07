# Car-Rental-System
# 🚗 DriveFleet — Car Rental System

A full-stack car rental management platform with:
- **React** frontend (dark luxury UI, hover effects, car cards)
- **Node.js + Express** REST API backend
- **MySQL** database with full schema + seed data
- **JWT authentication** for user & admin roles

---

## 📁 Project Structure

```
car-rental-system/
├── backend/
│   ├── server.js          # Express API server
│   ├── schema.sql         # MySQL schema + seed data
│   ├── package.json
│   └── .env.example       # Environment variables template
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── index.js
    │   └── App.jsx        # Full React application
    └── package.json
```

---

## ⚡ Quick Setup

### 1. MySQL Database

```bash
# Open MySQL and run the schema
mysql -u root -p < backend/schema.sql
```

This creates the `car_rental` database with tables and 8 sample cars.

### 2. Backend Setup

```bash
cd backend

# Copy and configure env
cp .env.example .env
# Edit .env with your MySQL credentials

# Install dependencies
npm install

# Start server (port 5000)
npm run dev        # with nodemon (dev)
npm start          # production
```

### 3. Frontend Setup

```bash
cd frontend

npm install
npm start          # Starts on http://localhost:3000
```

---

## 🔑 Default Admin Login

| Field    | Value                   |
|----------|-------------------------|
| Email    | admin@carrental.com     |
| Password | password                |

> To create more admins: register with role = "Administrator" in the app.

---

## 🗄️ Database Tables

### `users`
| Column     | Type                   |
|------------|------------------------|
| id         | INT AUTO_INCREMENT PK  |
| name       | VARCHAR(100)           |
| email      | VARCHAR(150) UNIQUE    |
| password   | VARCHAR(255) bcrypt    |
| role       | ENUM(user, admin)      |
| created_at | TIMESTAMP              |

### `cars`
| Column        | Type                              |
|---------------|-----------------------------------|
| id            | INT AUTO_INCREMENT PK             |
| brand         | VARCHAR(80)                       |
| model         | VARCHAR(80)                       |
| year          | YEAR                              |
| color         | VARCHAR(50)                       |
| price_per_day | DECIMAL(10,2)                     |
| fuel_type     | ENUM(petrol, diesel, electric, hybrid)|
| transmission  | ENUM(automatic, manual)           |
| seats         | TINYINT                           |
| status        | ENUM(available, booked, maintenance)|
| image_url     | TEXT                              |
| description   | TEXT                              |

### `bookings`
| Column      | Type                                    |
|-------------|------------------------------------------|
| id          | INT AUTO_INCREMENT PK                   |
| user_id     | FK → users.id                           |
| car_id      | FK → cars.id                            |
| start_date  | DATE                                    |
| end_date    | DATE                                    |
| total_price | DECIMAL(10,2)                           |
| status      | ENUM(pending, confirmed, cancelled, completed)|

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| POST   | /api/register    | Create account    |
| POST   | /api/login       | Login → JWT token |

### Cars (all require auth)
| Method | Endpoint         | Role  | Description   |
|--------|------------------|-------|---------------|
| GET    | /api/cars        | Any   | List all cars |
| GET    | /api/cars/:id    | Any   | Get one car   |
| POST   | /api/cars        | Admin | Add car       |
| PUT    | /api/cars/:id    | Admin | Update car    |
| DELETE | /api/cars/:id    | Admin | Delete car    |

### Bookings (all require auth)
| Method | Endpoint                   | Role  | Description         |
|--------|----------------------------|-------|---------------------|
| GET    | /api/bookings              | Any   | List bookings       |
| POST   | /api/bookings              | User  | Create booking      |
| PUT    | /api/bookings/:id/status   | Admin | Update status       |

### Admin Only
| Method | Endpoint    | Description          |
|--------|-------------|----------------------|
| GET    | /api/users  | List all users       |
| GET    | /api/stats  | Dashboard statistics |

---

## ✨ Features

**User Portal**
- Browse all cars with search & status filter
- Beautiful car cards with hover lift/zoom effects
- Book cars with date picker and live price calculator
- View booking history

**Admin Portal**
- Dashboard with real-time stats (cars, users, revenue)
- Full CRUD on cars (add, edit, delete, status change)
- View and manage all bookings (confirm / cancel / complete)
- User management table

**UI Highlights**
- Dark luxury theme with red accent
- Bebas Neue display font + DM Sans body
- Hover effects: card lifts, image zoom, border glow
- Animated page load (staggered fade-up)
- Toast notifications
- Responsive grid layout

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (10 rounds)
- JWT tokens expire in **24 hours**
- Admin routes protected by middleware
- Use a strong `JWT_SECRET` in production
- Add HTTPS in production
