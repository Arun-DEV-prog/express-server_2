import { Router } from "express";
import { createIssues, getIssues, getIssueById, updateIssue } from "../controllers/issues.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/issues", getIssues);
router.get("/issues/:id", getIssueById);
router.post("/issues", auth, createIssues);
router.patch("/issues/:id", auth, updateIssue);

export default router;