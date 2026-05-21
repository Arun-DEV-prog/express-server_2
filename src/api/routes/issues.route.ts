import { Router } from "express";
import { createIssues, getIssues, getIssueById } from "../controllers/issues.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/issues", getIssues);
router.get("/issues/:id", getIssueById);
router.post("/issues", auth, createIssues);

export default router;