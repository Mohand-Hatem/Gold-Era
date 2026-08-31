import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    env: {
      NODE_ENV: "test",
      PORT: "8080",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/filox_test?sslmode=disable",
      DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/filox_test?sslmode=disable",
      JWT_SECRET: "test-jwt-secret-key-that-is-at-least-32-bytes-long",
      JWT_EXPIRES_IN: "7d",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_NAME: "Admin",
      ADMIN_PASSWORD: "AdminPassword123",
      CLOUDINARY_CLOUD_NAME: "mock-cloud",
      CLOUDINARY_API_KEY: "123456789012345",
      CLOUDINARY_API_SECRET: "mock-api-secret-123456789",
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "465",
      SMTP_SECURE: "true",
      SMTP_USER: "filox-test@example.com",
      SMTP_PASSWORD: "test-app-password",
      FRONTEND_URL: "http://localhost:3000",
      COOKIE_SECURE: "false",
      COOKIE_SAMESITE: "lax",
    },
  },
})
