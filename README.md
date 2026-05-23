# Express Server 2

A modern, production-ready Express.js API server built with TypeScript. This application provides comprehensive authentication and issue management functionality with JWT-based security, deployed on Vercel.

## 🚀 Live Deployment

**Live URL:** [https://express-server-2-five.vercel.app](https://express-server-2-five.vercel.app)

All API endpoints are accessible at the live URL above.

---

## ✨ Features

- ✅ **User Authentication** - Sign up, login, and logout functionality
- ✅ **JWT Authorization** - Secure API endpoints with JWT tokens
- ✅ **Issue Management** - Full CRUD operations for issues (Create, Read, Update, Delete)
- ✅ **Role-Based Access Control** - Contributor and Maintainer roles
- ✅ **PostgreSQL Database** - Persistent data storage with Neon Database
- ✅ **Password Security** - Bcrypt encryption for passwords
- ✅ **Global Error Handling** - Centralized error handling middleware
- ✅ **Request Validation** - Input validation for all endpoints
- ✅ **Type Safety** - Full TypeScript implementation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js 5.x |
| **Language** | TypeScript 6.x |
| **Database** | PostgreSQL (Neon Serverless) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | Bcrypt |
| **HTTP Client** | Cookie Parser, CORS |
| **Deployment** | Vercel (Serverless) |
| **Development** | tsx (TypeScript execution) |

---

## 📋 Prerequisites

Before setting up the project, ensure you have:

- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- npm or yarn package manager
- PostgreSQL database (or [Neon Database](https://neon.tech) free account)
- Git for version control

---

## 🔧 Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Arun-DEV-prog/express-server_2.git
cd express-server_2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_super_secret_jwt_key_here
```

**Environment Variables Explanation:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation

### 4. Database Setup

The database schema is automatically created on first run. Tables include:
- `users` - User accounts with authentication
- `issues` - Issue tracking and management

### 5. Run the Application

**Development Mode (with hot reload):**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Base URLs

- **Local Development:** `http://localhost:5000`
- **Production:** `https://express-server-2-five.vercel.app`

### Health Check

#### Server Status
```
GET /
```
**Response:** `Server is Running`

---

### 🔐 Authentication Endpoints (`/api/auth`)

#### Sign Up
```
POST /api/auth/signup
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "contributor"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor",
    "created_at": "2026-05-23T10:30:00Z",
    "updated_at": "2026-05-23T10:30:00Z"
  }
}
```

#### Login
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 📝 Issue Management Endpoints (`/api/issues`)

#### Get All Issues
```
GET /api/issues
```
**Query Parameters:**
- `sort` - `newest` or `oldest` (default: newest)
- `type` - `bug` or `feature_request`
- `status` - `open`, `in_progress`, or `resolved`

**Example:** `GET /api/issues?sort=newest&type=bug&status=open`

**Response (200):**
```json
{
  "success": true,
  "message": "Issues retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Login button not working",
      "description": "The login button doesn't respond to clicks",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-05-23T10:30:00Z",
      "updated_at": "2026-05-23T10:30:00Z"
    }
  ]
}
```

#### Get Issue by ID
```
GET /api/issues/:id
```
**Parameters:** `id` (number) - Issue ID

**Response (200):**
```json
{
  "success": true,
  "message": "Issue retrieved successfully",
  "data": {
    "id": 1,
    "title": "Login button not working",
    "description": "The login button doesn't respond to clicks",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-05-23T10:30:00Z",
    "updated_at": "2026-05-23T10:30:00Z"
  }
}
```

#### Create Issue
```
POST /api/issues
```
**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "title": "Login button not working",
  "description": "The login button doesn't respond to clicks on mobile devices",
  "type": "bug"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 2,
    "title": "Login button not working",
    "description": "The login button doesn't respond to clicks",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-05-23T11:00:00Z",
    "updated_at": "2026-05-23T11:00:00Z"
  }
}
```

#### Update Issue
```
PATCH /api/issues/:id
```
**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body (any field is optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "type": "feature_request",
  "status": "in_progress"
}
```
**Response (200):** Updated issue object

#### Delete Issue
```
DELETE /api/issues/:id
```
**Headers:** `Authorization: Bearer <jwt_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Unique user identifier
- `name` - User's full name
- `email` - Unique email address
- `password` - Bcrypt-hashed password
- `role` - `contributor` or `maintainer`
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Issues Table
```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Unique issue identifier
- `title` - Issue title (max 150 chars)
- `description` - Detailed description (min 20 chars)
- `type` - `bug` or `feature_request`
- `status` - `open`, `in_progress`, or `resolved`
- `reporter_id` - Foreign key to users table
- `created_at` - Issue creation timestamp
- `updated_at` - Last update timestamp

---

## 📁 Project Structure

```
express-server_2/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts       # Auth endpoint handlers
│   │   │   └── issues.controller.ts     # Issues endpoint handlers
│   │   ├── routes/
│   │   │   ├── auth.route.ts            # Auth route definitions
│   │   │   └── issues.route.ts          # Issues route definitions
│   │   └── services/
│   │       ├── auth.service.ts          # Auth business logic
│   │       └── issues.service.ts        # Issues business logic
│   ├── config/
│   │   └── config.ts                    # Configuration & env variables
│   ├── DB/
│   │   ├── index.ts                     # Database connection setup
│   │   └── schema.ts                    # Database schema initialization
│   ├── middleware/
│   │   ├── auth.ts                      # JWT authentication middleware
│   │   └── globalErrorHandler.ts        # Global error handling
│   ├── types/
│   │   └── index.ts                     # TypeScript type definitions
│   ├── utils/
│   │   ├── jwt.ts                       # JWT token utilities
│   │   └── sendResponse.ts              # Response formatting utility
│   ├── app.ts                           # Express app configuration
│   └── server.ts                        # Server entry point
├── dist/                                # Compiled JavaScript (generated)
├── api/                                 # Vercel serverless handler (generated)
├── package.json                         # Project dependencies
├── tsconfig.json                        # TypeScript configuration
├── vercel.json                          # Vercel deployment config
├── .env.example                         # Environment variables template
└── README.md                            # This file
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in with email and password
2. Server returns a JWT token
3. Include token in Authorization header: `Authorization: Bearer <token>`
4. Token is verified by middleware before accessing protected endpoints

**Role-Based Permissions:**
- **Contributor** - Can create issues, view all issues, update/delete own issues
- **Maintainer** - Can manage all issues, update/delete any issue

---

## 🚢 Deployment

### Vercel Deployment

This project is configured for Vercel serverless deployment:

1. **GitHub Connection** - Connected to Vercel via GitHub
2. **Auto Deployment** - Pushes to main branch trigger automatic deployment
3. **Environment Variables** - Set in Vercel dashboard
4. **Build Command** - `npm run build` (compiles TypeScript)
5. **Runtime** - Node.js with serverless functions

**Deployed at:** [https://express-server-2-five.vercel.app](https://express-server-2-five.vercel.app)

---

## 📝 Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test
```

---

## ⚠️ Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": true
}
```

**Common HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📄 License

ISC

---

## 👨‍💻 Author

Arun DEV prog

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📧 Support

For issues or questions, please create an issue in the GitHub repository.

**Response (Error - 404):**

```json
{
  "success": false,
  "message": "Issue not found"
}
```

---

#### 3. Create Issue

Create a new issue. **Requires authentication.**

**Endpoint:**

```
POST /api/issues
```

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "New bug found",
  "description": "Detailed description of the issue",
  "status": "open"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": "new_issue_id",
    "title": "New bug found",
    "description": "Detailed description of the issue",
    "status": "open",
    "userId": "user_id",
    "createdAt": "2026-05-22T10:30:00Z",
    "updatedAt": "2026-05-22T10:30:00Z"
  }
}
```

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

---

#### 4. Update Issue

Update an existing issue. **Requires authentication.**

**Endpoint:**

```
PATCH /api/issues/:id
```

**Parameters:**

- `id` (string, required) - The issue ID to update

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "closed"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": "issue_id",
    "title": "Updated title",
    "description": "Updated description",
    "status": "closed",
    "updatedAt": "2026-05-22T10:35:00Z"
  }
}
```

**Response (Error - 403):**

```json
{
  "success": false,
  "message": "Forbidden - You can only update your own issues"
}
```

---

#### 5. Delete Issue

Delete an issue. **Requires authentication.**

**Endpoint:**

```
DELETE /api/issues/:id
```

**Parameters:**

- `id` (string, required) - The issue ID to delete

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Issue deleted successfully",
  "data": {
    "id": "issue_id"
  }
}
```

**Response (Error - 404):**

```json
{
  "success": false,
  "message": "Issue not found"
}
```

---

## Authentication & Authorization

### JWT Authentication

This API uses JWT (JSON Web Tokens) for authentication. Protected endpoints require a valid JWT token in the Authorization header.

**How to use:**

1. Sign up or login to receive a JWT token
2. Include the token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Protected Endpoints

The following endpoints require authentication:

- `POST /api/issues` - Create issue
- `PATCH /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Public Endpoints

The following endpoints are publicly accessible:

- `GET /` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/issues` - List all issues
- `GET /api/issues/:id` - Get specific issue

---

## Error Handling

All errors are handled by a global error handler and return consistent response format:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "error": "detailed error information"
}
```

### Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
```

---

## Development Tips

### Hot Reload

The development server uses `tsx watch` for automatic reload on file changes. Changes to TypeScript files will be automatically compiled and the server will restart.

### Database Migrations

Ensure your database schema is properly initialized before running the server. Check the `src/DB/schema.ts` file for schema definitions.

### Security Best Practices

- Always use HTTPS in production
- Keep your JWT secret key secure and unique
- Validate all user inputs
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Regularly update dependencies

---

## Troubleshooting

### Server won't start

- Check if port 5000 is already in use
- Verify DATABASE_URL is correct
- Ensure all dependencies are installed

### Database connection errors

- Verify DATABASE_URL format
- Check database credentials
- Ensure database server is running
- For Neon Database, check your connection string

### JWT Token errors

- Ensure JWT_SECRET is set in `.env`
- Verify token is not expired
- Check token format in Authorization header

### Port already in use

- Change PORT in `.env` file
- Or kill the process using port 5000

---

## API Testing

You can test these endpoints using:

- **Postman** - Import and test individual requests
- **cURL** - Command-line testing
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension

### Example cURL Commands

**Signup:**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John"}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

**Get Issues:**

```bash
curl -X GET http://localhost:5000/api/issues
```

**Create Issue (with authentication):**

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Issue","description":"Description","status":"open"}'
```

---

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

---

## License

ISC

---

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Last Updated:** May 22, 2026
