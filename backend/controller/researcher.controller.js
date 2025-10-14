import pool from '../db.js';

export const getResearchers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE role = $1 OR role = $2',['researcher', 'Researcher']);

    // Transform the database data to match your frontend structure
    const researchers = result.rows.map(user => ({
      id: user.id,
      name: user.username || 'Researcher',
      profilePic: user.profile_ic, 
      field: user.field, 
      institution: user.institution, 
      ongoingResearch: user.ongoing_research,
      contact: user.email || user.phone || 'No contact available'
    }));
    
    console.log('Transformed researchers:', researchers); // For debugging
    res.json(researchers);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getrecords = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM records');
    const records = result.rows.map(record => ({
      id: record.id,
      patientId: record.patient_id,
      researcherId: record.researcher_id,
      data: record.data,
      timestamp: record.timestamp
    }));
    console.log('Transformed records:', records); // For debugging
    res.json(records);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};