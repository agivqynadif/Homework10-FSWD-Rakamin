const movieController = require("../controllers/movieController.js");
const userController = require("../controllers/userController.js");

module.exports = function (app) {
  app.post("/movies/upload/:id", movieController.upload.single("photo"), movieController.uploadPhotoById);
  app.get("/movies", movieController.getAllMovies);
  app.post("/movies", movieController.addMovie);
  app.put("/movies/:id", movieController.updateMovieById);
  app.delete("/movies/:id", movieController.deleteMovieById);

  app.post("/register", userController.registerUser);
  app.get("/login", userController.loginUser);
  app.get("/users", userController.getAllUsers);
};
