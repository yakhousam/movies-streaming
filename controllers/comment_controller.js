const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');

const addComment = async (movie_id, user_id, text) => {
  if(text.length < 5){
    return
  }
  try {
    const newComment = await new Comment({
      movie_id,
      user_id,
      text
    }).save();
    return newComment
  } catch (error) {
    console.error(error);
  }
};

const getMovieComments = async (movie_id) =>{
  try {
    const comments = Comment.aggregate([
      {
        $match: { movie_id }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);
    return comments
  } catch (error) {
    console.error(error)
  }
}

module.exports = {addComment, getMovieComments};