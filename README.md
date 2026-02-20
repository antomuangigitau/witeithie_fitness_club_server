# Witeithie Running Club - Server

A robust Node.js/Express backend API for the Witeithie Running Club application. Provides RESTful endpoints for event management, user registrations, photo galleries, and admin authentication.

---

## 🌟 Features

- **📅 Event Management**: CRUD operations for running events
- **📝 Registration System**: Handle event sign-ups and bookings
- **🖼️ Gallery Management**: Store and retrieve event photos (Cloudinary integration)
- **🔐 Admin Authentication**: Secure cookie-based session management
- **🗄️ PostgreSQL Database**: Reliable data persistence with migrations
- **🔒 Security**: Password hashing with bcrypt, CORS protection
- **⚡ Performance**: Connection pooling, efficient queries

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) 20.x+
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM/Query**: [node-postgres (pg)](https://node-postgres.com/)
- **Authentication**: bcryptjs + cookie-based sessions
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Environment**: [dotenv](https://github.com/motdotla/dotenv)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **npm** package manager
- **Cloudinary Account** (free tier available at [cloudinary.com](https://cloudinary.com/))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 38.node/server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wrc_db;

# Exit psql
\q
```

#### Set Database URL

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/wrc_db

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@wrc.com
ADMIN_PASSWORD=your_secure_password

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key_here
```

> **Security Note**: Never commit `.env` file to version control!

### 4. Run Database Migrations

```bash
# Build TypeScript
npm run build

# Run migrations
npm run migrate
```

This will create the following tables:
- `events` - Running events
- `admins` - Admin users
- `gallery` - Event photos
- `registrations` - Event sign-ups
- `payments` - Payment records

### 5. Seed Admin User

```bash
npm run seed
```

This creates an admin user with credentials from your `.env` file.

### 6. Start Development Server

```bash
npm run dev
```

The server will be available at **http://localhost:5000**

---

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── controllers/           # Route handlers
│   │   ├── eventsController.ts
│   │   ├── galleryController.ts
│   │   ├── registrationController.ts
│   │   └── adminAuthController.ts
│   ├── routes/                # API routes
│   │   ├── events.ts
│   │   ├── gallery.ts
│   │   ├── registration.ts
│   │   └── adminAuth.ts
│   ├── middleware/            # Custom middleware
│   │   └── authMiddleware.ts
│   └── db/                    # Database
│       ├── db.ts             # PostgreSQL connection pool
│       ├── migrate.ts        # Migration runner
│       ├── seedAdmin.ts      # Admin seeder
│       └── migrate/          # SQL migration files
└── dist/                      # Compiled JavaScript (generated)
```

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed admin user |

---

## 🌐 API Endpoints

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/events` | Get all events | No |
| `GET` | `/api/v1/events/:id` | Get event by ID | No |
| `POST` | `/api/v1/events` | Create new event | Yes |
| `PUT` | `/api/v1/events/:id` | Update event | Yes |
| `DELETE` | `/api/v1/events/:id` | Delete event | Yes |

### Gallery

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/gallery` | Get all gallery images | No |
| `GET` | `/api/v1/gallery/event/:eventId` | Get images for event | No |
| `POST` | `/api/v1/gallery/bulk` | Upload multiple images | Yes |
| `PUT` | `/api/v1/gallery/:id/position` | Update image position | Yes |
| `DELETE` | `/api/v1/gallery/:id` | Delete image | Yes |

### Registrations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/registrations` | Get all registrations | Yes |
| `GET` | `/api/v1/registrations/event/:eventId` | Get registrations for event | Yes |
| `POST` | `/api/v1/registrations` | Create registration | No |

### Admin Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/admin/login` | Admin login | No |
| `POST` | `/api/v1/admin/logout` | Admin logout | Yes |
| `GET` | `/api/v1/admin/session` | Check session | Yes |
| `PUT` | `/api/v1/admin/activity` | Update activity | Yes |

---

## 🔒 Authentication

The server uses **cookie-based authentication** for admin users:

1. Admin logs in with email/password
2. Password is verified using bcrypt
3. Session cookie is set (httpOnly, secure in production)
4. Protected routes check for valid session
5. Session expires after 30 days of inactivity

### Protected Routes

All `POST`, `PUT`, and `DELETE` operations require authentication. The `authMiddleware` validates the session cookie.

---

## 🗄️ Database Schema

### Events Table
```sql
- id (UUID, primary key)
- title (VARCHAR)
- description (TEXT)
- event_datetime (TIMESTAMP)
- location (VARCHAR)
- distance (VARCHAR)
- difficulty (VARCHAR)
- max_participants (INTEGER)
- current_participants (INTEGER)
- image_url (TEXT)
- price (DECIMAL)
- itinerary (JSONB)
- guide (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Gallery Table
```sql
- id (UUID, primary key)
- event_id (UUID, foreign key)
- image_url (TEXT)
- caption (TEXT)
- position (INTEGER)
- created_at (TIMESTAMP)
```

### Registrations Table
```sql
- id (UUID, primary key)
- event_id (UUID, foreign key)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR)
- phone_number (VARCHAR)
- emergency_contact (VARCHAR)
- emergency_phone (VARCHAR)
- status (VARCHAR)
- created_at (TIMESTAMP)
```

### Admins Table
```sql
- id (UUID, primary key)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

---

## 🔄 Data Flow

### Request Flow
1. Client sends request to Express route
2. Middleware validates authentication (if required)
3. Controller handles business logic
4. Database query executed via pg pool
5. Response sent back to client (JSON)

### Type Conversion
- **Frontend**: Uses `camelCase` (JavaScript convention)
- **Backend**: Uses `snake_case` (SQL convention)
- Conversion happens in controllers/API layer

---

## 🐛 Troubleshooting

### "DATABASE_URL environment variable is not defined"
- Ensure `.env` file exists in `server` directory
- Check that `DATABASE_URL` is properly formatted

### "Connection refused" to PostgreSQL
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -U postgres -l`
- Verify credentials in `DATABASE_URL`

### "Migration failed"
- Ensure database is created first
- Check migration files in `src/db/migrate/`
- Run migrations in order (001, 002, 003, etc.)

### CORS errors from frontend
- Verify `CORS_ORIGIN` in app.ts matches frontend URL
- Check that credentials are included in fetch requests

---

## 🔧 Development Tips

### Adding a New Migration

1. Create new file: `src/db/migrate/006_your_migration.sql`
2. Write SQL for schema changes
3. Run `npm run build && npm run migrate`

### Testing API Endpoints

Use tools like:
- **Postman** or **Insomnia** for API testing
- **curl** for command-line testing

Example:
```bash
# Get all events
curl http://localhost:5000/api/v1/events

# Login as admin
curl -X POST http://localhost:5000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wrc.com","password":"your_password"}'
```

---

## 📚 Documentation

- [Authentication Flow](../client/docs/auth-flow.md) - How admin auth works
- [Type Safety Guide](../client/docs/type-safety-guide.md) - Frontend-backend type mapping

---

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Ensure these are set in production:
- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `SESSION_SECRET` (strong random string)
- Cloudinary credentials

### Start Production Server

```bash
npm run start
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make database changes via migrations (never modify existing migrations)
3. Test all endpoints thoroughly
4. Ensure TypeScript compiles without errors
5. Submit a pull request

---

## 📄 License

This project is private and proprietary to Witeithie Running Club.

---

## 🆘 Support

For issues or questions:
- Check PostgreSQL logs for database errors
- Review Express console output for request errors
- Verify environment variables are set correctly
- Ensure migrations have run successfully
