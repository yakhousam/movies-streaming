const router = require('express').Router();
const { google } = require('googleapis');

router.get('/video', (req, res) => {
  if (req.session[req.session.movie_id]) {
    return res.send(req.session[req.session.movie_id]);
  }
  const queryYoutube = req.session.queryYoutube;
  if (!queryYoutube) {
    return res.send('no video');
  }
 
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.youtubeAuth
  });
  youtube.search.list(
    {
      part: 'snippet',
      fields: 'items/id',
      q: queryYoutube,
      maxResults: 1
    },
    (err, videos) => {
      if (err) {
        console.error(err);
        throw err;
      }
     
      const response = videos.data.items.map(element => {
        console.log('https://www.youtube.com/watch?v=' + element.id.videoId);
        return element.id.videoId;
      });
      req.session[req.session.movie_id] = response;
      res.send(response);
    }
  );
});

module.exports = router;
