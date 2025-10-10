import express from "express";
import {PORT} from "./config/env.js";
import pool from "./db.js";
import cors from 'cors';
import authRouter from './routes/auth.route';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth',authRouter);

pool.connect().then(()=>{
      console.log("Connected to PostgreSQL")
    }).catch((err)=>{
      console.log("Error Connecting to PostgreSQL",err);
    })

app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});