const db = require("../config/db");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");


exports.results = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id,
        c.fullname,
        p.title,
        COUNT(v.id) AS total_votes
      FROM candidates c
      LEFT JOIN votes v
        ON c.id = v.candidate_id
      LEFT JOIN positions p
        ON c.position_id = p.id
      GROUP BY c.id, c.fullname, p.title
      ORDER BY total_votes DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



exports.candidateVoters = async (req, res) => {
  try {
    const candidateId = req.params.id;

    const [candidate] = await db.query(
      `
      SELECT
        c.id,
        c.fullname,
        p.title AS position
      FROM candidates c
      JOIN positions p
      ON c.position_id = p.id
      WHERE c.id = ?
      `,
      [candidateId]
    );

    if (candidate.length === 0) {
      return res.status(404).json({
        message: "Candidate not found"
      });
    }

    const [voters] = await db.query(
      `
      SELECT
        u.id,
        u.fullname,
        u.email,
        v.voted_at
      FROM votes v
      JOIN users u
      ON v.user_id = u.id
      WHERE v.candidate_id = ?
      ORDER BY v.voted_at DESC
      `,
      [candidateId]
    );

    res.json({
      candidate: candidate[0],
      totalVotes: voters.length,
      voters
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



exports.getStats = async (req, res) => {
  try {
    const [[candidateCount]] = await db.query(
      `
      SELECT COUNT(*) AS total_candidates
      FROM candidates
      `
    );

    const [[voteCount]] = await db.query(
      `
      SELECT COUNT(*) AS total_votes
      FROM votes
      `
    );

    const [[positionCount]] = await db.query(
      `
      SELECT COUNT(*) AS total_positions
      FROM positions
      `
    );

    res.json({
      totalCandidates:
        candidateCount.total_candidates,

      totalVotes:
        voteCount.total_votes,

      totalPositions:
        positionCount.total_positions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard stats",
    });
  }
};



exports.getVoters = async (
  req,
  res
) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id,
        student_id,
        fullname,
        email,
        role
      FROM users
      WHERE role = 'user'
      ORDER BY fullname
      `
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load voters",
    });
  }
};

exports.createVoter = async (req, res) => {
  try {
    const {
      student_id,
      fullname,
      email,
      password,
    } = req.body;

    if (
      !student_id ||
      !fullname ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const [existingStudent] =
      await db.query(
        `
        SELECT id
        FROM users
        WHERE student_id = ?
        `,
        [student_id]
      );

    if (existingStudent.length > 0) {
      return res.status(400).json({
        message:
          "Student ID already exists",
      });
    }

    const [existingEmail] =
      await db.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        message:
          "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users
      (
        student_id,
        fullname,
        email,
        password,
        role
      )
      VALUES
      (
        ?, ?, ?, ?, 'user'
      )
      `,
      [
        student_id,
        fullname,
        email,
        hashedPassword,
      ]
    );

    res.json({
      message:
        "Voter created successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to create voter",
    });
  }
};





exports.deleteVoter = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
      AND role = 'user'
      `,
      [id]
    );

    res.json({
      message: "Voter deleted"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete voter"
    });
  }
};
exports.resetPassword = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      password
    } = req.body;

    const hashed =
      await bcrypt.hash(password, 10);

    await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashed, id]
    );

    res.json({
      message: "Password reset"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to reset password"
    });
  }
};
``


exports.chartData = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.fullname,
        COUNT(v.id) AS votes
      FROM candidates c
      LEFT JOIN votes v
        ON v.candidate_id = c.id
      GROUP BY c.id
      ORDER BY votes DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load chart data"
    });
  }
};



exports.positionResults = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.title AS position,
        c.id,
        c.fullname,
        c.photo,
        COUNT(v.id) AS votes
      FROM candidates c
      LEFT JOIN positions p
        ON p.id = c.position_id
      LEFT JOIN votes v
        ON v.candidate_id = c.id
      GROUP BY
        p.title,
        c.id,
        c.fullname,
        c.photo
      ORDER BY
        p.title,
        votes DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load results"
    });
  }
};


exports.importVoters = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Excel file required",
      });
    }

    const XLSX = require("xlsx");
    const bcrypt =
      require("bcryptjs");

    const workbook =
      XLSX.read(req.file.buffer, {
        type: "buffer",
      });

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const {
        student_id,
        fullname,
        email,
        password,
      } = row;

      const [existingStudent] =
        await db.query(
          `
          SELECT id
          FROM users
          WHERE student_id = ?
          `,
          [student_id]
        );

      if (existingStudent.length) {
        skipped++;
        continue;
      }

      const [existingEmail] =
        await db.query(
          `
          SELECT id
          FROM users
          WHERE email = ?
          `,
          [email]
        );

      if (existingEmail.length) {
        skipped++;
        continue;
      }

      const hashed =
        await bcrypt.hash(
          String(password),
          10
        );

      await db.query(
        `
        INSERT INTO users
        (
          student_id,
          fullname,
          email,
          password,
          role
        )
        VALUES
        (
          ?, ?, ?, ?, 'user'
        )
        `,
        [
          student_id,
          fullname,
          email,
          hashed,
        ]
      );

      imported++;
    }

    res.json({
      message:
        "Import completed successfully",
      imported,
      skipped,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Import failed",
    });
  }
};
