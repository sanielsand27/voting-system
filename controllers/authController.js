const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

  const { fullname, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users
     (fullname,email,password)
     VALUES (?,?,?)`,
    [fullname, email, hashed]
  );

  res.json({
    message: "User registered"
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
         OR student_id = ?
      `,
      [username, username]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        student_id: user.student_id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};
