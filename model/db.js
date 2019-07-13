const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const bcrypt = require('bcrypt');

const dbUri =
  process.env.NODE_ENV === 'production'
    ? process.env.dbUri
    : 'mongodb://localhost/movies';

mongoose.connect(dbUri, { useNewUrlParser: true });
mongoose.connection.on('connected', () =>
  console.log('Mongoose is connected to ', dbUri)
);
mongoose.connection.on('error', err => console.log(err));
mongoose.connection.on('disconnected', () =>
  console.log('Mongoose is disconnected')
);

process.on('SIGINT', () => {
  console.log('Mongoose disconnected on exit process');
  process.exit(0);
});


/*************************************************
                  User Schema
*************************************************/                  
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    trim: true,
    maxlength: [20, 'username must be at most 20 carracters long']
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: [8, 'password must be at least 8 carracters long']
  }
});

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified()) return next();
  bcrypt.hash(user.password, 12, (err, hashedPassword) => {
    if (err) return next(err);
    user.password = hashedPassword;
    next();
  });
});

userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};
/************************************************************** */

/*********************************
          comment schema
 **********************************/
const commentSchema = new Schema({
  movie_id : mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
  text: String
})

 /************************************************* */
/*------------------------------------
        movie schema
-------------------------------------- */

const movieSchema = new Schema({
  title: String,
  year: {},
  runtime: {},
  cast: [String],
  poster: String,
  plot: String,
  fullplot: String,
  lastupdated: Date,
  type: String,
  directors: [String],
  writers: [String],
  imdb: {},
  tomatoes: {},
  countries: [String],
  rated: String,
  genres: [String],
  view: Number
});


//  const movieSchema = new Schema({}, { strict: false });

mongoose.model('Movie', movieSchema);
mongoose.model('User', userSchema);
mongoose.model('Comment', commentSchema);

//db.movies.aggregate([{$match:{"type":"series"}}, {$project: {year: {$toInt:"$year"}}}])