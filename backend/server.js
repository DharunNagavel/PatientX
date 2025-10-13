import express from "express";
import {PORT} from "./config/env.js";
import pool from "./db.js";
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import connectPgSimple from 'connect-pg-simple';
import authRouter from './routes/auth.route.js';
import dataRouter from "./routes/data.route.js";
import researcherRouter from "./routes/researcher.route.js";

const app = express();
app.use(cors());
app.use(express.json());
const PgSession = connectPgSimple(session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth',authRouter);
app.use('/api/block/data',dataRouter);
app.use('/api',researcherRouter);

pool.connect().then(()=>{
      console.log("Connected to PostgreSQL")
    }).catch((err)=>{
      console.log("Error Connecting to PostgreSQL",err);
    })

app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});