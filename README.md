# Express Server 2

A modern, production-ready Express.js API server built with TypeScript. This application provides comprehensive authentication and issue management functionality with JWT-based security.

## Features

- ✅ User authentication (Sign up & Login)
- ✅ JWT-based authorization
- ✅ Issue management (CRUD operations)
- ✅ PostgreSQL database integration
- ✅ Global error handling
- ✅ Cookie-based session management
- ✅ Password encryption with bcrypt
- ✅ TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript 6.x
- **Database**: PostgreSQL (Neon Database)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt for password hashing
- **Development**: tsx with watch mode

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Neon Database account)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd express-server_2
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
express-server_2/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Authentication logic
│   │   │   └── issues.controller.ts    # Issues management logic
│   │   ├── routes/
│   │   │   ├── auth.route.ts           # Auth endpoints
│   │   │   └── issues.route.ts         # Issues endpoints
│   │   └── services/
│   │       ├── auth.service.ts         # Auth business logic
│   │       └── issues.service.ts       # Issues business logic
│   ├── config/
│   │   └── config.ts                   # Configuration management
│   ├── DB/
│   │   ├── index.ts                    # Database connection
│   │   └── schema.ts                   # Database schema
│   ├── middleware/
│   │   ├── auth.ts                     # JWT authentication middleware
│   │   └── globalErrorHandler.ts       # Global error handling
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   ├── utils/
│   │   ├── jwt.ts                      # JWT utilities
│   │   └── sendResponse.ts             # Response formatting utility
│   ├── app.ts                          # Express app configuration
│   └── server.ts                       # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Base URL

```
http://localhost:5000
```

### Health Check

#### Get Server Status

```
GET /
```

**Response:**

```
Server is Running
```

---

## Authentication Endpoints

### Base Path: `/api/auth`

#### 1. User Sign Up

Create a new user account.

**Endpoint:**

```
POST /api/auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "User already exists"
}
```

---

#### 2. User Login

Authenticate user and receive JWT token.

**Endpoint:**

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Issues Endpoints

### Base Path: `/api`

#### 1. Get All Issues

Retrieve all issues from the system.

**Endpoint:**

```
GET /api/issues
```

**Query Parameters:**

- Optional pagination parameters

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Issues retrieved successfully",
  "data": [
    {
      "id": "issue_1",
      "title": "Bug in login",
      "description": "Login button not working",
      "status": "open",
      "createdAt": "2026-05-22T10:30:00Z",
      "updatedAt": "2026-05-22T10:30:00Z"
    }
  ]
}
```

---

#### 2. Get Issue by ID

Retrieve a specific issue by its ID.

**Endpoint:**

```
GET /api/issues/:id
```

**Parameters:**

- `id` (string, required) - The issue ID

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Issue retrieved successfully",
  "data": {
    "id": "issue_1",
    "title": "Bug in login",
    "description": "Login button not working",
    "status": "open",
    "createdAt": "2026-05-22T10:30:00Z",
    "updatedAt": "2026-05-22T10:30:00Z"
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
