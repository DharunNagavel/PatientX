import pool from '../db.js';

export const getResearchers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE role = $1 OR role = $2',['researcher', 'Researcher']);

    
    // Transform the database data to match your frontend structure
    const researchers = result.rows.map(user => ({
      id: user.id,
      name: user.username || 'Researcher', // Using username since name field doesn't exist
      profilePic: '/meera.png', // Default image since profile_pic doesn't exist
      field: 'Medical Research', // Default since field doesn't exist in your table
      institution: 'Research Institution', // Default since institution doesn't exist
      ongoingResearch: ['Research in progress'], // Default since ongoing_research doesn't exist
      contact: user.email || user.phone || 'No contact available'
    }));
    
    console.log('Transformed researchers:', researchers); // For debugging
    res.json(researchers);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};