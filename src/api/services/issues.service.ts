
import { sql } from "../../DB/index";
import type { Issues, CreateReportInput } from "../../types/index";

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
}

export default new IssuesService();