import { Router } from "express";
import { createIssues, getIssues, getIssueById, updateIssue, deleteIssue } from "../controllers/issues.controller.js";
import { auth } from "../../middleware/auth.js";

const router = Router();

router.get("/issues", getIssues);
router.get("/issues/:id", getIssueById);
router.post("/issues", auth, createIssues);
router.patch("/issues/:id", auth, updateIssue);
router.delete("/issues/:id", auth, deleteIssue);

export default router;