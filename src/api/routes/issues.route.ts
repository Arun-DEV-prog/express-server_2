import { Router } from "express";
import { createIssues } from "../controllers/issues.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/issues", auth, createIssues);

export default router;