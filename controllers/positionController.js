const db = require("../config/db");

exports.getPositions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        description,
        max_votes
      FROM positions
      ORDER BY id ASC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



exports.createPosition = async (req, res) => {
  try {
    const {
      title,
      description,
      max_votes,
    } = req.body;

    await db.query(
      `
      INSERT INTO positions
      (
        title,
        description,
        max_votes
      )
      VALUES (?, ?, ?)
      `,
      [
        title,
        description || null,
        max_votes || 1,
      ]
    );

    res.json({
      message: "Position created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


exports.updatePosition = async (req, res) => {
  try {
    const {
      title,
      description,
      max_votes,
    } = req.body;

    await db.query(
      `
      UPDATE positions
      SET
        title = ?,
        description = ?,
        max_votes = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        max_votes || 1,
        req.params.id,
      ]
    );

    res.json({
      message: "Position updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




exports.deletePosition = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM positions WHERE id=?",
      [req.params.id]
    );

    res.json({
      message: "Position deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
``
