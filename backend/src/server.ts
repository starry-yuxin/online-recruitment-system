import fs from "fs";
import { env } from "./config/env";
import { createApp } from "./app";

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
fs.mkdirSync(env.BACKUP_DIR, { recursive: true });

const app = createApp();
app.listen(env.PORT, () => {
  console.log(`Backend running: http://localhost:${env.PORT}`);
});
