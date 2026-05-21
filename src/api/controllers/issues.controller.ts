import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import IssuesService from "../services/issues.service";
import type { Issues, ReportType } from "../../types/index";

export const createIssues = async (req: Request, res: Response) => {
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

        if (!type || !['bug', 'feature_request'].includes(type)) {
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

        
        const issue = await IssuesService.create({
            title: title.trim(),
            description,
            type: type as ReportType,
            reporter_id: reporterId,
        });

        return sendResponse(
            res,
            { message: "Issue created successfully", data: issue },
            201
        );
    } catch (error: any) {
        return sendResponse(
            res,
            { message: error.message || "Failed to create issue", error: true },
            500
        );
    }
};