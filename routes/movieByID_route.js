const router = require("express").Router();
const { getMovieById } = require("../controllers/movies_controller");
const Comment = require("../controllers/comment_controller");
const { formatTime } = require("../controllers/utils");
const mongoose = require("mongoose");

router
  .route("/id/:id")
  .get(async (req, res, next) => {
    try {
      const id = mongoose.Types.ObjectId(req.params.id);
      req.session.movie_id = id;
      const movie = await getMovieById(id);
      if (!movie) {
        return res.render("movieByID", {
          movie: { title: "No movie with such id found in database " },
          title: "Not found"
        });
      }
      movie.runtime = formatTime(movie.runtime);
      const comments = await Comment.getMovieComments(id);
      // console.log("movieById =", movie);
      // console.log("comments =", comments);
      const queryYoutube = `${movie.title} ${movie.type} official trailer 
    ${movie.year} ${(movie.cast && movie.cast[0]) ||
        (movie.directors && movie.directors[0])} `;
      req.session.queryYoutube = queryYoutube;
      res.render("movieByID", {
        movie,
        comments,
        title: movie.title
      });
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    try {
      await Comment.addComment(
        req.session.movie_id,
        req.user.id,
        req.body.text.slice(0, 200)
      );
      res.redirect(`/id/${req.session.movie_id}`);
    } catch (error) {
      console.log(error);
      res.redirect(`/id/${req.session.movie_id}`);
    }
  });

module.exports = router;
