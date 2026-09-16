const db = require("../config/db");


exports.getCandidates = async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      candidates.*,
      positions.title,
      positions.max_votes
    FROM candidates
    JOIN positions
      ON candidates.position_id = positions.id
    ORDER BY positions.id ASC
  `);

  res.json(rows);
};


exports.getCandidatesByPosition = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        candidates.*,
        positions.title,
        positions.max_votes
      FROM candidates
      JOIN positions
        ON candidates.position_id = positions.id
      WHERE candidates.position_id = ?
      `,
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




exports.createCandidate = async (
  req,
  res
) => {
  try {

    const {
      fullname,
      bio,
      position_id
    } = req.body;

    const photo = req.file
      ? `/uploads/candidates/${req.file.filename}`
      : null;

    await db.query(
      `
      INSERT INTO candidates
      (
        fullname,
        photo,
        bio,
        position_id
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        fullname,
        photo,
        bio,
        position_id
      ]
    );

    res.json({
      message: "Candidate added"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
exports.deleteCandidate = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM candidates
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      message: "Candidate deleted"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete candidate"
    });
  }
};
