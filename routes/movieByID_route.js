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
      comments.forEach(comment =>{
        let username, photo;
        if(comment.user[0].local) username = comment.user[0].local.username
        else if (comment.user[0].social)
          if(comment.user[0].social.github) {
            username = comment.user[0].social.github.username
            photo = comment.user[0].social.github.photo
          }else if(comment.user[0].social.twitter) {
            username = comment.user[0].social.twitter.username
            photo = comment.user[0].social.twitter.photo
          }
        comment.user = { username, photo}
        return comment;
      })
      // console.log("comments =", comments);
      
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
    const id = mongoose.Types.ObjectId(req.params.id);
    try {
      await Comment.addComment(
        id,
        req.user.id,
        req.body.text.slice(0, 200)
      );
      res.redirect(`/id/${id}`);
    } catch (error) {
      console.log(error);
      res.redirect(`/id/${id}`);
    }
  });

module.exports = router;
