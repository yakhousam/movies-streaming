const router = require('express').Router();
const fetch = require('node-fetch');

router.get('/wiki/', async (req, res) => {
  const wiki = req.session.people;
  console.log('wiki =', wiki);
  if (!wiki) {
    return res.send('no wiki param');
  }
  if (req.session.wiki && req.session.wiki[wiki]) {
    return res.json(req.session.wiki[wiki]);
  }
  // console.log(wiki);
  fetch(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${wiki}&limit=1`
  )
    .then(res => res.json())
    .then(json => {
      if (!req.session.wiki) {
        req.session.wiki = {};
      }
      req.session.wiki[wiki] = json;
      // console.log(json);
      res.json(json);
    })
    .catch(err => res.json({ error: err }));
});

module.exports = router;