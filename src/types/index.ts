export const role  =["contributor"," maintainer"] as const;

export  type Role=(typeof role)[number];

export type User={
     id: number;
     name: string;
     email: string;
     password: string;
     role: Role;
     created_at: Date;
     updated_at: Date;
}


export type RUser=Omit<User, "id" | "created_at" | "updated_at"  | "password">


export const reportType = ["bug", "feature_request"] as const;
export type ReportType = (typeof reportType)[number];

export const reportStatus = ["open", "in_progress", "resolved"] as const;
export type ReportStatus = (typeof reportStatus)[number];

export type Issues = {
     id: number;
     title: string;
     description: string;
     type: ReportType;
     status: ReportStatus;
     reporter_id: number;
     created_at: Date;
     updated_at: Date;
}c

export type CreateReportInput = Omit<Report, "id" | "created_at" | "updated_at" | "status"> & {
     status?: ReportStatus;
}

export type UpdateReportInput = Partial<Omit<Report, "id" | "created_at" | "updated_at" | "reporter_id">>