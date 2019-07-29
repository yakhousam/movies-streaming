const mongoose = require("mongoose");
const Comment = mongoose.model("Comment");

const addComment = async (movie_id, user_id, text) => {
  // console.log("movieId=", movie_id);
  // console.log("user id=", user_id);
  if (text.length < 5) {
    return;
  }
  try {
    const newComment = await new Comment({
      movie_id,
      commentedBy: user_id,
      text
    }).save();
    return newComment;
  } catch (error) {
    console.error(error);
  }
};

const getMovieComments = async movie_id => {
  try {
    // const comments = await Comment.aggregate([
    //   {
    //     $match: { movie_id }
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'commentedBy',
    //       foreignField: '_id',
    //       as: 'user'
    //     }
    //   }
    // ]);

    const comments = await Comment.find({ movie_id }).populate("commentedBy");
    return comments;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { addComment, getMovieComments };
