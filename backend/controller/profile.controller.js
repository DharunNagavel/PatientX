import pool from "../db.js";

export const addResearch = async (req, res) => {
  const { user_id, newStudy } = req.body;

  try {
    // Step 1: Fetch existing array
    const result = await pool.query(
      `SELECT ongoing_research 
       FROM users 
       WHERE user_id = $1`,
      [user_id]
    );

    let research = [];

    if (result.rows.length && result.rows[0].ongoing_research) {
      research = result.rows[0].ongoing_research;  // already JSONB
    }

    // Step 2: Push new study
    research.push(newStudy);

    // Step 3: Update JSONB column
    await pool.query(
      `UPDATE users 
       SET ongoing_research = $1
       WHERE user_id = $2`,
      [JSON.stringify(research), user_id]
    );

    res.json({
      success: true,
      message: "Research added successfully",
      updated: research,
    });

  } catch (error) {
    console.error("❌ Error in addResearch:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getResearch = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT ongoing_research FROM users WHERE user_id = $1",
      [user_id]
    );

    const research = result.rows[0]?.ongoing_research || [];

    res.json({
      success: true,
      research: research
    });

  } catch (error) {
    console.error("❌ Error fetching research:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

