import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import Redis from 'ioredis';

const redis = new Redis();

export const verifyToken = async (req, res, next) => 
{
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json('No token provided');

  const isBlacklisted = await redis.get(token);
  if (isBlacklisted) return res.json('Token blacklisted');

  try 
  {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch 
  {
    res.json('Invalid token');
  }
};