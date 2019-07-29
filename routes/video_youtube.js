const router = require('express').Router();
const { google } = require('googleapis');

router.get('/video', (req, res) => {
  const queryYoutube = req.query.queryYoutube;
  if (req.session[queryYoutube]) {
    // console.log("queryYoutube session =", req.session.queryYoutube)
    return res.send(req.session[queryYoutube]);
  }
  // console.log('queryYoutube =', queryYoutube)
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
        // console.log('https://www.youtube.com/watch?v=' + element.id.videoId);
        return element.id.videoId;
      });
      req.session[queryYoutube] = response; // save the video link in the session so we do not request the same video more than once
      res.send(response);
    }
  );
});

module.exports = router;
