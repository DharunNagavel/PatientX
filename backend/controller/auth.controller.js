import bcrypt from 'bcryptjs';
import pool from '../db.js';
import JWT from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const signup = async (req, res) => {
  const { username, mail, phone, password, role } = req.body;
  try 
  {
    const userExists = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
    if (userExists.rows.length > 0) 
        {
            return res.send({ message: 'User already exists' });
        }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, mail, phone, password, role) VALUES ($1, $2, $3, $4, $5)',
      [username, mail, phone, hashedPassword, role]
    );
    const user = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
    const token = JWT.sign({ mail }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.send({
      message: 'User registered and logged in successfully',
      token,
      role : role,
      username : username,
      user_id: user.user_id
    });
  } catch (err) 
  {
    console.log(err);
  }
};

export const signin = async (req, res) => {
  console.log("Signin request body:", req.body);
  const { mail, password} = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
    if (result.rows.length === 0) 
        {
            return res.send('User does not exist');
        }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.send({ message: 'Invalid password' });
    }
    const token = JWT.sign({ mail }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.send({
      message: 'Login successful',
      token,
      role : user.role,
      username : user.username,
      user_id: user.user_id
    });
  } 
  catch (err) 
  {
    console.log(err);
  }
};

export const signout = async (req, res) => 
  {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) 
  {
    const decoded = JWT.decode(token);
    const exp = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
    await redis.set(token, 'blacklisted', 'EX', exp); 
  }
  res.json('Logged out successfully');
};
