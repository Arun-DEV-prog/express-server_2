
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
    
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/config/config.ts
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ quiet: true });
var config = {
  port: process.env.PORT || 5e3,
  node_env: process.env.NODE_ENV,
  database_url: process.env.DATABASE_URL,
  access_token_secret: process.env.JWT_SECRET,
  refres_token_secret: process.env.JWT_SECRET
};

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal server error",
    stack: config.node_env === "development" && err instanceof Error ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);

// src/api/routes/auth.route.ts
var import_express = require("express");

// src/api/services/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);

// src/DB/index.ts
var import_serverless = require("@neondatabase/serverless");

// src/DB/schema.ts
var createSchema = async () => {
  await sql`
          CREATE TABLE IF NOT EXISTS users (
               id SERIAL PRIMARY KEY,
               name VARCHAR(255) NOT NULL,
               email VARCHAR(255) UNIQUE NOT NULL,
               password VARCHAR(255) NOT NULL,
               role VARCHAR(50) NOT NULL DEFAULT 'contributor',
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
     `;
  await sql`
          CREATE TABLE IF NOT EXISTS issues (
               id SERIAL PRIMARY KEY,
               title VARCHAR(150) NOT NULL,
               description TEXT NOT NULL CHECK (length(description) >= 20),
               type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
               status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
               reporter_id INTEGER NOT NULL,
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
     `;
};

// src/DB/index.ts
var sql = (0, import_serverless.neon)(config.database_url);
var schemaCreated = false;
var initDB = async () => {
  if (schemaCreated) {
    console.log("Database already initialized");
    return;
  }
  try {
    await createSchema();
    schemaCreated = true;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database initialization error:", error);
    schemaCreated = false;
  }
};

// src/api/services/auth.service.ts
var AuthService = class {
  async hashPassword(password) {
    const hash = await import_bcrypt.default.hash(password, 10);
    return hash;
  }
  async comparePassword(password, hash) {
    return await import_bcrypt.default.compare(password, hash);
  }
  async createUser(user) {
    const { name, email, password, role } = user;
    const hash = await this.hashPassword(password);
    const result = await sql`
         INSERT INTO users (name, email, password, role)
         VALUES (${name}, ${email}, ${hash}, COALESCE(${role}, 'contributor'))
       
        RETURNING id, name, email, role, created_at, updated_at
       `;
    return result[0];
  }
  async loginUser(email, password) {
    const result = await sql`
      SELECT id, name, email, password, role, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;
    if (!result || result.length === 0) {
      return null;
    }
    const user = result[0];
    if (!user || !user.password) {
      return null;
    }
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};
var auth_service_default = new AuthService();

// src/utils/sendResponse.ts
var sendResponse = (res, { message, data, error }, status = 200) => {
  res.status(status).json({
    success: error ? false : true,
    message,
    data: error ? void 0 : data
  });
};

// src/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var verifyToken = (token, type) => {
  const secret = type === "refress" ? config.refres_token_secret : config.access_token_secret;
  const decoded = import_jsonwebtoken.default.verify(token, secret);
  return decoded;
};
var signToken = (payload) => {
  const accessToken = import_jsonwebtoken.default.sign(payload, config.access_token_secret, {
    expiresIn: "1h"
  });
  const refresToken = import_jsonwebtoken.default.sign(payload, config.refres_token_secret, {
    expiresIn: "7d"
  });
  return { accessToken, refresToken };
};

// src/api/controllers/auth.controller.ts
var signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await auth_service_default.createUser({ name, email, password, role });
    if (!user) {
      return sendResponse(res, { message: "Failed to create user", error: true }, 400);
    }
    sendResponse(res, { message: "User registered successfully", data: user }, 200);
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === "23505" && error.constraint === "users_email_key") {
      return sendResponse(res, { message: "Email already exists", error: true }, 400);
    }
    sendResponse(res, { message: "Internal server error", error: true }, 500);
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, { message: "Email and password are required", error: true }, 400);
    }
    const user = await auth_service_default.loginUser(email, password);
    if (!user) {
      return sendResponse(res, { message: "Invalid email or password", error: true }, 401);
    }
    const tokenPayload = {
      id: user.id,
      name: user.name,
      role: user.role
    };
    const { accessToken, refresToken } = signToken(tokenPayload);
    sendResponse(
      res,
      {
        message: "Login successful",
        data: {
          token: accessToken,
          refreshToken: refresToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      },
      200
    );
  } catch (error) {
    console.error("Login error:", error);
    sendResponse(res, { message: "Internal server error", error: true }, 500);
  }
};

// src/api/routes/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", signup);
router.post("/login", login);
var auth_route_default = router;

// src/api/routes/issues.route.ts
var import_express2 = require("express");

// src/api/services/issues.service.ts
var IssuesService = class {
  async create(data) {
    try {
      const result = await sql`
                INSERT INTO issues (title, description, type, status, reporter_id)
                VALUES (${data.title}, ${data.description}, ${data.type}, ${data.status || "open"}, ${data.reporter_id})
                RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
            `;
      if (!result || result.length === 0) {
        throw new Error("Failed to create issue");
      }
      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getAll(sort = "newest", type, status) {
    try {
      let queryResult = [];
      const orderClause = sort === "oldest" ? "ASC" : "DESC";
      if (type && status) {
        queryResult = await sql`
                    SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                           u.id as reporter_id_u, u.name, u.role
                    FROM issues i
                    LEFT JOIN users u ON i.reporter_id = u.id
                    WHERE i.type = ${type} AND i.status = ${status}
                    ORDER BY i.created_at ${orderClause}
                `;
      } else if (type) {
        queryResult = await sql`
                    SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                           u.id as reporter_id_u, u.name, u.role
                    FROM issues i
                    LEFT JOIN users u ON i.reporter_id = u.id
                    WHERE i.type = ${type}
                    ORDER BY i.created_at ${orderClause}
                `;
      } else if (status) {
        queryResult = await sql`
                    SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                           u.id as reporter_id_u, u.name, u.role
                    FROM issues i
                    LEFT JOIN users u ON i.reporter_id = u.id
                    WHERE i.status = ${status}
                    ORDER BY i.created_at ${orderClause}
                `;
      } else {
        queryResult = await sql`
                    SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                           u.id as reporter_id_u, u.name, u.role
                    FROM issues i
                    LEFT JOIN users u ON i.reporter_id = u.id
                    ORDER BY i.created_at ${orderClause}
                `;
      }
      if (!queryResult || queryResult.length === 0) {
        return [];
      }
      return queryResult.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        reporter_id: item.reporter_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        reporter: {
          id: item.reporter_id_u,
          name: item.name,
          role: item.role
        }
      }));
    } catch (error) {
      throw error;
    }
  }
  async getById(id) {
    try {
      const result = await sql`
                SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                       u.id as reporter_id_u, u.name, u.role
                FROM issues i
                LEFT JOIN users u ON i.reporter_id = u.id
                WHERE i.id = ${id}
            `;
      if (!result || result.length === 0) {
        return null;
      }
      const row = result[0];
      if (!row.reporter_id_u) {
        throw new Error("Reporter not found for issue");
      }
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        status: row.status,
        reporter: {
          id: row.reporter_id_u,
          name: row.name,
          role: row.role
        },
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("Error fetching issue by ID:", error);
      throw error;
    }
  }
  async update(id, data) {
    try {
      const currentIssues = await sql`
                SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                FROM issues
                WHERE id = ${id}
            `;
      if (!currentIssues || currentIssues.length === 0) {
        throw new Error("Issue not found");
      }
      const current = currentIssues[0];
      const updateData = {
        title: data.title ?? current.title,
        description: data.description ?? current.description,
        type: data.type ?? current.type,
        status: data.status ?? current.status
      };
      const result = await sql`
                UPDATE issues
                SET title = ${updateData.title}, description = ${updateData.description}, type = ${updateData.type}, status = ${updateData.status}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
            `;
      if (!result || result.length === 0) {
        throw new Error("Failed to update issue");
      }
      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async delete(id) {
    try {
      const issues = await sql`
                SELECT id
                FROM issues
                WHERE id = ${id}
            `;
      if (!issues || issues.length === 0) {
        throw new Error("Issue not found");
      }
      await sql`
                DELETE FROM issues
                WHERE id = ${id}
            `;
    } catch (error) {
      throw error;
    }
  }
};
var issues_service_default = new IssuesService();

// src/api/controllers/issues.controller.ts
var createIssues = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user?.id;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return sendResponse(
        res,
        { message: "Title is required and must be a non-empty string", error: true },
        400
      );
    }
    if (!description || typeof description !== "string" || description.length < 20) {
      return sendResponse(
        res,
        { message: "Description is required and must be at least 20 characters long", error: true },
        400
      );
    }
    if (!type || !["bug", "feature_request"].includes(type)) {
      return sendResponse(
        res,
        { message: "Type must be either 'bug' or 'feature_request'", error: true },
        400
      );
    }
    if (!reporterId) {
      return sendResponse(
        res,
        { message: "Reporter ID could not be determined from token", error: true },
        401
      );
    }
    const issue = await issues_service_default.create({
      title: title.trim(),
      description,
      type,
      reporter_id: reporterId
    });
    return sendResponse(
      res,
      { message: "Issue created successfully", data: issue },
      201
    );
  } catch (error) {
    return sendResponse(
      res,
      { message: error.message || "Failed to create issue", error: true },
      500
    );
  }
};
var getIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const validSort = sort === "oldest" ? "oldest" : "newest";
    let validType;
    if (type) {
      const typeStr = String(type).toLowerCase();
      if (!["bug", "feature_request"].includes(typeStr)) {
        return sendResponse(
          res,
          { message: "Type must be either 'bug' or 'feature_request'", error: true },
          400
        );
      }
      validType = typeStr;
    }
    let validStatus;
    if (status) {
      const statusStr = String(status).toLowerCase();
      if (!["open", "in_progress", "resolved"].includes(statusStr)) {
        return sendResponse(
          res,
          { message: "Status must be one of: 'open', 'in_progress', 'resolved'", error: true },
          400
        );
      }
      validStatus = statusStr;
    }
    const issues = await issues_service_default.getAll(validSort, validType, validStatus);
    return sendResponse(
      res,
      { message: "Issues retrieved successfully", data: issues },
      200
    );
  } catch (error) {
    return sendResponse(
      res,
      { message: error.message || "Failed to retrieve issues", error: true },
      500
    );
  }
};
var getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      return sendResponse(
        res,
        { message: "Invalid issue ID", error: true },
        400
      );
    }
    const issueId = parseInt(id, 10);
    if (isNaN(issueId) || issueId <= 0) {
      return sendResponse(
        res,
        { message: "Invalid issue ID. Must be a positive number", error: true },
        400
      );
    }
    const issue = await issues_service_default.getById(issueId);
    if (!issue) {
      return sendResponse(
        res,
        { message: "Issue not found", error: true },
        404
      );
    }
    return sendResponse(
      res,
      { message: "Issue retrieved successfully", data: issue },
      200
    );
  } catch (error) {
    return sendResponse(
      res,
      { message: error.message || "Failed to retrieve issue", error: true },
      500
    );
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (typeof id !== "string") {
      return sendResponse(
        res,
        { message: "Invalid issue ID", error: true },
        400
      );
    }
    const issueId = parseInt(id, 10);
    if (isNaN(issueId) || issueId <= 0) {
      return sendResponse(
        res,
        { message: "Invalid issue ID. Must be a positive number", error: true },
        400
      );
    }
    if (!title && !description && !type && !status) {
      return sendResponse(
        res,
        { message: "At least one field (title, description, type, status) must be provided", error: true },
        400
      );
    }
    if (title !== void 0 && (typeof title !== "string" || title.trim().length === 0)) {
      return sendResponse(
        res,
        { message: "Title must be a non-empty string", error: true },
        400
      );
    }
    if (description !== void 0 && (typeof description !== "string" || description.length < 20)) {
      return sendResponse(
        res,
        { message: "Description must be at least 20 characters long", error: true },
        400
      );
    }
    if (type !== void 0 && !["bug", "feature_request"].includes(type)) {
      return sendResponse(
        res,
        { message: "Type must be either 'bug' or 'feature_request'", error: true },
        400
      );
    }
    if (status !== void 0 && !["open", "in_progress", "resolved"].includes(status)) {
      return sendResponse(
        res,
        { message: "Status must be one of: 'open', 'in_progress', 'resolved'", error: true },
        400
      );
    }
    const issues = await sql`
            SELECT id, title, description, type, status, reporter_id, created_at, updated_at
            FROM issues
            WHERE id = ${issueId}
        `;
    if (!issues || issues.length === 0) {
      return sendResponse(
        res,
        { message: "Issue not found", error: true },
        404
      );
    }
    const issue = issues[0];
    if (!issue) {
      return sendResponse(
        res,
        { message: "Issue not found", error: true },
        404
      );
    }
    const isMaintainer = userRole === "maintainer";
    const isOwnIssue = userId === issue.reporter_id;
    const isOpenStatus = issue.status === "open";
    if (!isMaintainer && (!isOwnIssue || !isOpenStatus)) {
      return sendResponse(
        res,
        {
          message: "Access denied. Contributors can only update their own open issues, maintainers can update any issue",
          error: true
        },
        403
      );
    }
    const updateData = {};
    if (title !== void 0) updateData.title = title.trim();
    if (description !== void 0) updateData.description = description;
    if (type !== void 0) updateData.type = type;
    if (status !== void 0) updateData.status = status;
    const updatedIssue = await issues_service_default.update(issueId, updateData);
    return sendResponse(
      res,
      { message: "Issue updated successfully", data: updatedIssue },
      200
    );
  } catch (error) {
    return sendResponse(
      res,
      { message: error.message || "Failed to update issue", error: true },
      500
    );
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    if (userRole !== "maintainer") {
      return sendResponse(
        res,
        { message: "Access denied. Only maintainers can delete issues", error: true },
        403
      );
    }
    if (typeof id !== "string") {
      return sendResponse(
        res,
        { message: "Invalid issue ID", error: true },
        400
      );
    }
    const issueId = parseInt(id, 10);
    if (isNaN(issueId) || issueId <= 0) {
      return sendResponse(
        res,
        { message: "Invalid issue ID. Must be a positive number", error: true },
        400
      );
    }
    try {
      await issues_service_default.delete(issueId);
    } catch (error) {
      if (error.message === "Issue not found") {
        return sendResponse(
          res,
          { message: "Issue not found", error: true },
          404
        );
      }
      throw error;
    }
    return sendResponse(
      res,
      { message: "Issue deleted successfully" },
      200
    );
  } catch (error) {
    return sendResponse(
      res,
      { message: error.message || "Failed to delete issue", error: true },
      500
    );
  }
};

// src/middleware/auth.ts
var auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse(res, { message: "Access token missing", error: true }, 401);
    }
    const payload = verifyToken(token, "access");
    if (!payload) {
      return sendResponse(res, { message: "Invalid access token", error: true }, 401);
    }
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

// src/api/routes/issues.route.ts
var router2 = (0, import_express2.Router)();
router2.get("/issues", getIssues);
router2.get("/issues/:id", getIssueById);
router2.post("/issues", auth, createIssues);
router2.patch("/issues/:id", auth, updateIssue);
router2.delete("/issues/:id", auth, deleteIssue);
var issues_route_default = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json({ limit: "10mb" }));
app.use(import_express3.default.urlencoded({ limit: "10mb", extended: true }));
app.use((0, import_cookie_parser.default)());
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.use("/api/auth", auth_route_default);
app.use("/api", issues_route_default);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var dbInitialized = false;
app_default.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (err) {
      console.error("Database initialization error:", err);
      return res.status(500).json({ success: false, message: "Database connection failed" });
    }
  }
  next();
});
var server_default = app_default;
if (process.env.NODE_ENV !== "production") {
  app_default.listen(config.port, () => {
    console.log(`server running on port ${config.port}`);
  });
}
//# sourceMappingURL=server.cjs.map