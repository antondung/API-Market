export type Role = "consumer" | "provider" | "admin";
export interface Session {
  name: string;
  email: string;
  role: Role;
  expiresAt: number;
}
