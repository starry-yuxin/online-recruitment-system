import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 3001),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "recruitment_system",
  JWT_SECRET: process.env.JWT_SECRET || "change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  BACKUP_DIR: process.env.BACKUP_DIR || "./backups"
};
