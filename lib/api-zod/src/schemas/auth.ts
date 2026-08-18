import { z } from "zod";

export const SignupRequest = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginRequest = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UserResponse = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.string(),
});

export const AuthResponse = z.object({
  user: UserResponse,
});

export type SignupRequest = z.infer<typeof SignupRequest>;
export type LoginRequest = z.infer<typeof LoginRequest>;
export type UserResponse = z.infer<typeof UserResponse>;
export type AuthResponse = z.infer<typeof AuthResponse>;
