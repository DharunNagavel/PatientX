import bcrypt from 'bcryptjs';
import pool from '../db.js';
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
    const newUser = await pool.query(
      'INSERT INTO users (username, mail, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, mail',
      [username, mail, phone, hashedPassword, role]
    );
    req.session.userId = newUser.rows[0].id;
    res.send({
      message: 'User registered and logged in successfully',
      userId: req.session.userId,
    });
  } catch (err) {
    console.log(err);
  }
};

export const signin = async (req, res) => {
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
    req.session.userId = user.id;
    res.send({
      message: 'Login successful',
      userId: req.session.userId,
    });
  } 
  catch (err) 
  {
    console.log(err);
  }
};

export const signout = (req, res) => 
{
  req.session.destroy(err => {
    if (err) return res.send('Logout failed');
    res.clearCookie('connect.sid');
    res.send('Logged out successfully');
  });
};
