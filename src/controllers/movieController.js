const multer = require("multer");
const path = require("path");
const pool = require("../config/connection.js");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}` + path.extname(file.originalname));
  },
});

const multerFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(png|jpg)$/)) {
    return cb(new Error("Pleas upload an image."));
  }
  cb(null, true);
};

exports.upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhotoById = async (req, res) => {
  const photoName = req.file.filename;
  const movieId = req.params.id;
  const uploadQuery = await pool.query(`UPDATE movies SET photo = $1 WHERE id = $2`, [photoName, movieId]);
  res.status(200).json({ statusCode: 200, status: true, message: "Image uploaded.", data: [] });
};

exports.getAllMovies = async (req, res) => {
  try {
    const allMoviesQuery = await pool.query(`SELECT * FROM movies ORDER BY id ASC`);
    res.status(200).json(allMoviesQuery.rows);
  } catch (error) {
    console.error("Error while get movies data.", error);
    res.status(500).json({ error: "An error occured" });
  }
};

exports.addMovie = async (req, res) => {
  const { id, title, genres, year } = req.body;

  if (!id || !title || !genres || !year) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  const insertMovieQuery = `
      INSERT INTO movies ( id, title, genres, year)
      VALUES ( $1, $2, $3, $4)
      RETURNING *;`;

  try {
    const result = await pool.query(insertMovieQuery, [id, title, genres, year]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the movie." });
  }
};

exports.updateMovieById = async (req, res) => {
  const movieId = req.params.id;
  const { title, genres, year } = req.body;

  if (!title || !genres || !year) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  const updateQuery = `
      UPDATE movies
      SET title = $1, genres = $2, year = $3
      WHERE id = $4
      RETURNING *;
    `;

  try {
    const result = await pool.query(updateQuery, [title, genres, year, movieId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Movie not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the movie." });
  }
};

exports.deleteMovieById = async (req, res) => {
  const movieId = req.params.id;

  const deleteQuery = `
    DELETE FROM movies WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(deleteQuery, [movieId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Movie not found." });
    }

    res.status(200).json({ message: "Movie has been deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the movie." });
  }
};
