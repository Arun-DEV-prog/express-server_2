
import { sql } from "../../DB/index";
import type { Issues, CreateReportInput, ReportStatus, ReportType, IssueWithReporter, IssueReporter } from "../../types/index";

class IssuesService {
    async create(data: CreateReportInput): Promise<Issues> {
        try {
            const result = await sql<Issues[]>`
                INSERT INTO issues (title, description, type, status, reporter_id)
                VALUES (${data.title}, ${data.description}, ${data.type}, ${data.status || 'open'}, ${data.reporter_id})
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

    async getAll(
        sort: "newest" | "oldest" = "newest",
        type?: ReportType,
        status?: ReportStatus
    ): Promise<IssueWithReporter[]> {
        try {
            // Build query with dynamic filters
            let issues: Issues[];

            if (type && status) {
                issues = sort === 'oldest'
                    ? await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        WHERE type = ${type} AND status = ${status}
                        ORDER BY created_at ASC
                    `
                    : await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        WHERE type = ${type} AND status = ${status}
                        ORDER BY created_at DESC
                    `;
            } else if (type) {
                issues = sort === 'oldest'
                    ? await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        WHERE type = ${type}
                        ORDER BY created_at ASC
                    `
                    : await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        WHERE type = ${type}
                        ORDER BY created_at DESC
                    `;
            } else if (status) {
                issues = sort === 'oldest'
                    ? await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        WHERE status = ${status}
                        ORDER BY created_at ASC
                    `
                    : await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        WHERE status = ${status}
                        ORDER BY created_at DESC
                    `;
            } else {
                issues = sort === 'oldest'
                    ? await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        ORDER BY created_at ASC
                    `
                    : await sql<Issues[]>`
                        SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                        FROM issues
                        ORDER BY created_at DESC
                    `;
            }

            if (!issues || issues.length === 0) {
                return [];
            }

            // Get unique reporter IDs
            const reporterIds = [...new Set(issues.map(i => i.reporter_id))];

            // Fetch all reporters in batch query
            let reporters: IssueReporter[] = [];
            if (reporterIds.length > 0) {
                reporters = await sql<IssueReporter[]>`
                    SELECT id, name, role
                    FROM users
                    WHERE id IN (${reporterIds.join(',')})
                `;
            }

            // Create a map for easy lookup
            const reporterMap = new Map(reporters.map(r => [r.id, r]));

            // Combine issues with reporter data
            return issues.map(issue => ({
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                status: issue.status,
                reporter: reporterMap.get(issue.reporter_id)!,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
            }));
        } catch (error) {
            throw error;
        }
    }

    async getById(id: number): Promise<IssueWithReporter | null> {
        try {
            const issues = await sql<Issues[]>`
                SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                FROM issues
                WHERE id = ${id}
            `;

            if (!issues || issues.length === 0) {
                return null;
            }

            const issue = issues[0];

            // Fetch reporter details
            const reporters = await sql<IssueReporter[]>`
                SELECT id, name, role
                FROM users
                WHERE id = ${issue.reporter_id}
            `;

            if (!reporters || reporters.length === 0) {
                throw new Error("Reporter not found");
            }

            const reporter = reporters[0];

            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                status: issue.status,
                reporter,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
            };
        } catch (error) {
            throw error;
        }
    }

    async update(
        id: number,
        data: Partial<Pick<Issues, "title" | "description" | "type" | "status">>
    ): Promise<Issues> {
        try {
            // Get current issue to ensure it exists
            const currentIssues = await sql<Issues[]>`
                SELECT id, title, description, type, status, reporter_id, created_at, updated_at
                FROM issues
                WHERE id = ${id}
            `;

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

            // Update the issue
            const result = await sql<Issues[]>`
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

    async delete(id: number): Promise<void> {
        try {
            // Check if issue exists
            const issues = await sql<Issues[]>`
                SELECT id
                FROM issues
                WHERE id = ${id}
            `;

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