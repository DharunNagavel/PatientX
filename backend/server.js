import express from "express";
import { PORT } from "./config/env.js";
import pool from "./db.js";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import dataRouter from "./routes/data.route.js";
import researcherRouter from "./routes/researcher.route.js";

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json({ limit: "200mb" })); // only this handles JSON limit
app.use(express.urlencoded({ limit: "200mb", extended: true })); // handles form data


// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/block/data", dataRouter);
app.use("/api", researcherRouter);

// ✅ PostgreSQL connection
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Error Connecting to PostgreSQL", err);
  });

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
