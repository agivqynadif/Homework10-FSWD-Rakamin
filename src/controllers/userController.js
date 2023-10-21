const pool = require("../config/connection.js");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { id, email, gender, password, role } = req.body;

  if (!id || !email || !gender || !password || !role) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  const registerQuery = `
      INSERT INTO users (id, email, gender, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

  try {
    const result = await pool.query(registerQuery, [id, email, gender, password, role]);
    const newUser = result.rows[0];
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while registering the user." });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide both email and password." });
  }

  const loginQuery = `
      SELECT email, password FROM users
      WHERE email = $1;
    `;

  try {
    const result = await pool.query(loginQuery, [email]);

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Authentication failed. User not found." });
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return res.status(401).json({ error: "Authentication failed. Incorrect password." });
    }

    const token = jwt.sign({ email: user.email, password: user.password }, process.env.SECRET_TOKEN, { expiresIn: "1h" });

    res.status(200).json({ message: "Authentication successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during authentication." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const allUsersQuery = await pool.query(`SELECT * FROM users ORDER BY id ASC`);
    res.status(200).json(allUsersQuery.rows);
  } catch (error) {
    console.error("Error while get movies data.", error);
    res.status(500).json({ error: "An error occured" });
  }
};
