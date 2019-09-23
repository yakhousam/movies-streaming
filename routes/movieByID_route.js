const router = require('express').Router();
const { getMovieById } = require('../controllers/movies_controller');
const Comment = require('../controllers/comment_controller');
const { formatTime } = require('../controllers/utils');
const mongoose = require('mongoose');

router
  .route('/id/:id')
  .get(async (req, res, next) => {
    try {
      const id = mongoose.Types.ObjectId(req.params.id);
      const movie = await getMovieById(id);
      if (!movie) {
        return res.render('movieByID', {
          movie: { title: 'No movie with such id found in database ' },
          title: 'Not found'
        });
      }
      movie.runtime = formatTime(movie.runtime);
      const comments = await Comment.getMovieComments(id);
      const cmts = comments.map(comment => {
        let username, photo;
        const {local, social } = comment.commentedBy
        const userid = comment.commentedBy._id;
        if (local.username) {
          username = comment.commentedBy.local.username;
        } else if (comment.commentedBy.social)
          if (social.github) {
            username = social.github.username;
            photo = social.github.photo;
          } else if (social.twitter) {
            username = social.twitter.username;
            photo = social.twitter.photo;
          } else if (social.google) {
            username = social.google.username;
            photo = social.google.photo;
          }
        const user = { username, photo, userid };
        const { _id, text } = comment;
        return { _id, text, user };
      });

      res.render('movieByID', {
        movie,
        comments: cmts,
        title: movie.title
      });
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    const id = mongoose.Types.ObjectId(req.params.id);
    try {
      await Comment.addComment(id, req.user.id, req.body.text.slice(0, 200));
      res.redirect(`/id/${id}`);
    } catch (error) {
      console.log(error);
      res.redirect(`/id/${id}`);
    }
  });

module.exports = router;
