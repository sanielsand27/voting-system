const db = require("../config/db");

exports.vote = async (req, res) => {
  const userId = req.user.id;

  const {
    candidate_id,
    position_id
  } = req.body;

  const [existing] = await db.query(
    `
    SELECT *
    FROM votes
    WHERE user_id = ?
    AND position_id = ?
    `,
    [userId, position_id]
  );

  if (existing.length) {
    return res.status(400).json({
      message: "Already voted for this position"
    });
  }

  await db.query(
    `
    INSERT INTO votes
    (user_id, candidate_id, position_id)
    VALUES (?, ?, ?)
    `,
    [
      userId,
      candidate_id,
      position_id
    ]
  );

  res.json({
    message: "Vote submitted"
  });
};

exports.myVotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [votes] = await db.query(
      `
      SELECT
        candidate_id,
        position_id,
        voted_at
      FROM votes
      WHERE user_id = ?
      `,
      [userId]
    );

    res.json(votes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load votes"
    });
  }
};


exports.results = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id,
        c.fullname,
        c.photo,
        p.title,
        COUNT(v.id) AS total_votes
      FROM candidates c
      LEFT JOIN votes v
        ON v.candidate_id = c.id
      LEFT JOIN positions p
        ON p.id = c.position_id
      GROUP BY c.id
      ORDER BY total_votes DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load results",
    });
  }
};


exports.submitVotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { votes } = req.body;

    console.log("USER ID:", userId);
    console.log("RECEIVED VOTES:", votes);

    if (!votes || votes.length === 0) {
      return res.status(400).json({
        message: "No votes submitted",
      });
    }

    // Prevent voting twice
    const [existingVotes] = await db.query(
      `
      SELECT id
      FROM votes
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (existingVotes.length > 0) {
      return res.status(400).json({
        message: "You have already voted",
      });
    }

    // Get all position limits
    const [positions] = await db.query(
      `
      SELECT
        id,
        max_votes
      FROM positions
      `
    );

    console.log("POSITIONS:", positions);

    const limits = {};

    positions.forEach((position) => {
      limits[position.id] = position.max_votes;
    });

    console.log("LIMITS:", limits);

    // Count submitted votes by position
    const groupedVotes = {};

    votes.forEach((vote) => {
      if (!groupedVotes[vote.position_id]) {
        groupedVotes[vote.position_id] = 0;
      }

      groupedVotes[vote.position_id]++;
    });

    console.log(
      "GROUPED VOTES:",
      groupedVotes
    );

    // Validate max_votes
    for (const positionId in groupedVotes) {
      const voteCount =
        groupedVotes[positionId];

      const maxVotes =
        limits[positionId] || 1;

      if (voteCount > maxVotes) {
        return res.status(400).json({
          message: `Maximum ${maxVotes} candidate(s) allowed for this position`,
        });
      }
    }

    // Validate candidates exist
    for (const vote of votes) {
      const [candidateRows] =
        await db.query(
          `
          SELECT id
          FROM candidates
          WHERE id = ?
          `,
          [vote.candidate_id]
        );

      if (!candidateRows.length) {
        return res.status(400).json({
          message: `Candidate ${vote.candidate_id} not found`,
        });
      }
    }

    // Insert votes
    for (const vote of votes) {
      console.log(
        "INSERTING:",
        vote
      );

      await db.query(
        `
        INSERT INTO votes
        (
          user_id,
          candidate_id,
          position_id
        )
        VALUES (?, ?, ?)
        `,
        [
          userId,
          vote.candidate_id,
          vote.position_id,
        ]
      );
    }

    res.json({
      message:
        "Ballot submitted successfully",
    });
  } catch (error) {
    console.error(
      "SUBMIT VOTES ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};






exports.voteSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        p.title AS position,
        c.fullname,
        c.photo,
        v.voted_at
      FROM votes v
      JOIN candidates c
        ON c.id = v.candidate_id
      JOIN positions p
        ON p.id = v.position_id
      WHERE v.user_id = ?
      ORDER BY p.id
      `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load vote summary",
    });
  }
};
