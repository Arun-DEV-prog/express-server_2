import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import IssuesService from "../services/issues.service";
import type { Issues, ReportType, ReportStatus } from "../../types/index";
import { sql } from "../../DB/index";

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

export const getIssues = async (req: Request, res: Response) => {
    try {
        const { sort, type, status } = req.query;

        // Validate sort parameter
        const validSort = sort === "oldest" ? "oldest" : "newest";

        // Validate type parameter
        let validType: ReportType | undefined;
        if (type) {
            const typeStr = String(type).toLowerCase();
            if (!['bug', 'feature_request'].includes(typeStr)) {
                return sendResponse(
                    res,
                    { message: "Type must be either 'bug' or 'feature_request'", error: true },
                    400
                );
            }
            validType = typeStr as ReportType;
        }

        // Validate status parameter
        let validStatus: ReportStatus | undefined;
        if (status) {
            const statusStr = String(status).toLowerCase();
            if (!['open', 'in_progress', 'resolved'].includes(statusStr)) {
                return sendResponse(
                    res,
                    { message: "Status must be one of: 'open', 'in_progress', 'resolved'", error: true },
                    400
                );
            }
            validStatus = statusStr as ReportStatus;
        }

        // Get issues from service
        const issues = await IssuesService.getAll(validSort, validType, validStatus);

        return sendResponse(
            res,
            { message: "Issues retrieved successfully", data: issues },
            200
        );
    } catch (error: any) {
        return sendResponse(
            res,
            { message: error.message || "Failed to retrieve issues", error: true },
            500
        );
    }
};

export const getIssueById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate ID is a number
        const issueId = parseInt(id, 10);
        if (isNaN(issueId) || issueId <= 0) {
            return sendResponse(
                res,
                { message: "Invalid issue ID. Must be a positive number", error: true },
                400
            );
        }

        // Get issue from service
        const issue = await IssuesService.getById(issueId);

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
    } catch (error: any) {
        return sendResponse(
            res,
            { message: error.message || "Failed to retrieve issue", error: true },
            500
        );
    }
};

export const updateIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, type, status } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Validate ID
        const issueId = parseInt(id, 10);
        if (isNaN(issueId) || issueId <= 0) {
            return sendResponse(
                res,
                { message: "Invalid issue ID. Must be a positive number", error: true },
                400
            );
        }

        // Check if at least one field is provided
        if (!title && !description && !type && !status) {
            return sendResponse(
                res,
                { message: "At least one field (title, description, type, status) must be provided", error: true },
                400
            );
        }

        // Validate provided fields
        if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
            return sendResponse(
                res,
                { message: "Title must be a non-empty string", error: true },
                400
            );
        }

        if (description !== undefined && (typeof description !== "string" || description.length < 20)) {
            return sendResponse(
                res,
                { message: "Description must be at least 20 characters long", error: true },
                400
            );
        }

        if (type !== undefined && !['bug', 'feature_request'].includes(type)) {
            return sendResponse(
                res,
                { message: "Type must be either 'bug' or 'feature_request'", error: true },
                400
            );
        }

        if (status !== undefined && !['open', 'in_progress', 'resolved'].includes(status)) {
            return sendResponse(
                res,
                { message: "Status must be one of: 'open', 'in_progress', 'resolved'", error: true },
                400
            );
        }

        // Get the issue to check permissions
        const issues = await sql<Issues[]>`
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

        // Check access control
        // Maintainer can update any issue
        const isMaintainer = userRole === "maintainer";
        // Contributor can only update their own issue AND only if status is open
        const isOwnIssue = userId === issue.reporter_id;
        const isOpenStatus = issue.status === "open";

        if (!isMaintainer && (!isOwnIssue || !isOpenStatus)) {
            return sendResponse(
                res,
                {
                    message: "Access denied. Contributors can only update their own open issues, maintainers can update any issue",
                    error: true,
                },
                403
            );
        }

        // Prepare update data
        const updateData: Partial<Pick<Issues, "title" | "description" | "type" | "status">> = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type as ReportType;
        if (status !== undefined) updateData.status = status as ReportStatus;

        // Update the issue
        const updatedIssue = await IssuesService.update(issueId, updateData);

        return sendResponse(
            res,
            { message: "Issue updated successfully", data: updatedIssue },
            200
        );
    } catch (error: any) {
        return sendResponse(
            res,
            { message: error.message || "Failed to update issue", error: true },
            500
        );
    }
};

export const deleteIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role;

        // Check if user is maintainer
        if (userRole !== "maintainer") {
            return sendResponse(
                res,
                { message: "Access denied. Only maintainers can delete issues", error: true },
                403
            );
        }

        // Validate ID
        const issueId = parseInt(id, 10);
        if (isNaN(issueId) || issueId <= 0) {
            return sendResponse(
                res,
                { message: "Invalid issue ID. Must be a positive number", error: true },
                400
            );
        }

        // Delete the issue
        try {
            await IssuesService.delete(issueId);
        } catch (error: any) {
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
    } catch (error: any) {
        return sendResponse(
            res,
            { message: error.message || "Failed to delete issue", error: true },
            500
        );
    }
};