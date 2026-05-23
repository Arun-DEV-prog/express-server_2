
import { sql } from "../../DB/index.js";
import type { Issues, CreateReportInput, ReportStatus, ReportType, IssueWithReporter, IssueReporter } from "../../types/index.js";

class IssuesService {
    async create(data: CreateReportInput): Promise<Issues> {
        try {
            const result = (await sql`
                INSERT INTO issues (title, description, type, status, reporter_id)
                VALUES (${data.title}, ${data.description}, ${data.type}, ${data.status || 'open'}, ${data.reporter_id})
                RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
            `) as any[];
            
            if (!result || result.length === 0) {
                throw new Error("Failed to create issue");
            }
            
            return result[0];
        } catch (error) {
            throw error;
        }
    }

    async getAll(
        sort: "newest" | "oldest" = "newest",
        type?: ReportType,
        status?: ReportStatus
    ): Promise<IssueWithReporter[]> {
        try {
            // Build query with dynamic filters using JOIN to get reporter info
            let queryResult: any[] = [];

            if (type && status) {
                queryResult = sort === 'oldest'
                    ? (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        WHERE i.type = ${type} AND i.status = ${status}
                        ORDER BY i.created_at ASC
                    `) as any[]
                    : (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        WHERE i.type = ${type} AND i.status = ${status}
                        ORDER BY i.created_at DESC
                    `) as any[];
            } else if (type) {
                queryResult = sort === 'oldest'
                    ? (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        WHERE i.type = ${type}
                        ORDER BY i.created_at ASC
                    `) as any[]
                    : (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        WHERE i.type = ${type}
                        ORDER BY i.created_at DESC
                    `) as any[];
            } else if (status) {
                queryResult = sort === 'oldest'
                    ? (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        WHERE i.status = ${status}
                        ORDER BY i.created_at ASC
                    `) as any[]
                    : (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        WHERE i.status = ${status}
                        ORDER BY i.created_at DESC
                    `) as any[];
            } else {
                queryResult = sort === 'oldest'
                    ? (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        ORDER BY i.created_at ASC
                    `) as any[]
                    : (await sql`
                        SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                               u.id as reporter_id_u, u.name, u.role
                        FROM issues i
                        LEFT JOIN users u ON i.reporter_id = u.id
                        ORDER BY i.created_at DESC
                    `) as any[];
            }

            if (!queryResult || queryResult.length === 0) {
                return [];
            }

            // Map the joined results
            return queryResult.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                type: row.type,
                status: row.status,
                reporter: {
                    id: row.reporter_id_u,
                    name: row.name,
                    role: row.role,
                },
                created_at: row.created_at,
                updated_at: row.updated_at,
            }));
        } catch (error) {
            console.error("Error fetching all issues:", error);
            throw error;
        }
    }

    async getById(id: number): Promise<IssueWithReporter | null> {
        try {
            const result = (await sql`
                SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
                       u.id as reporter_id_u, u.name, u.role
                FROM issues i
                LEFT JOIN users u ON i.reporter_id = u.id
                WHERE i.id = ${id}
            `) as any[];

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
                    role: row.role,
                },
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        } catch (error) {
            console.error("Error fetching issue by ID:", error);
            throw error;
        }
    }

    async update(
        id: number,
        data: Partial<Pick<Issues, "title" | "description" | "type" | "status">>
    ): Promise<Issues> {
        try {
            // Get current issue to ensure it exists
            const currentIssues = (await sql`
                SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                FROM issues
                WHERE id = ${id}
            `) as any[];

            if (!currentIssues || currentIssues.length === 0) {
                throw new Error("Issue not found");
            }

            const current = currentIssues[0];

            // Build update object with existing values as defaults
            const updateData = {
                title: data.title ?? current.title,
                description: data.description ?? current.description,
                type: data.type ?? current.type,
                status: data.status ?? current.status,
            };

           
            const result = (await sql`
                UPDATE issues
                SET title = ${updateData.title}, description = ${updateData.description}, type = ${updateData.type}, status = ${updateData.status}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
            `) as any[];

            if (!result || result.length === 0) {
                throw new Error("Failed to update issue");
            }

            return result[0];
        } catch (error) {
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            // Check if issue exists
            const issues = (await sql`
                SELECT id
                FROM issues
                WHERE id = ${id}
            `) as any[];

            if (!issues || issues.length === 0) {
                throw new Error("Issue not found");
            }

            // Delete the issue
            await sql`
                DELETE FROM issues
                WHERE id = ${id}
            `;
        } catch (error) {
            throw error;
        }
    }
}

export default new IssuesService();