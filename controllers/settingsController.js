// controllers/settingsController.js

const db = require("../config/db");

exports.getElectionStatus = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `
      SELECT election_open
      FROM settings
      LIMIT 1
      `
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.toggleElectionStatus =
  async (req, res) => {
    try {
      const { election_open } =
        req.body;

      await db.query(
        `
        UPDATE settings
        SET election_open = ?
        WHERE id = 1
        `,
        [election_open]
      );
        res.json({
        message:
          "Election status updated",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
``


