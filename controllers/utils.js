function getPages(currentPage, count, limit){
  let pages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (currentPage > 5) {
    pages = pages.map(n => n + currentPage - 5);
  }
  return pages.filter(x => x * limit < count);
};

function formatTime (runtime){
  runtime = parseInt(runtime);
  let hour = Math.trunc(runtime / 60);
  let minute = runtime - (hour * 60);
  hour = hour > 10 ? hour : '0' + hour;
  minute = minute > 10 ? minute : '0' + minute;
  return `${hour}h:${minute}min`;
};

function formatQuery(req, res) {
  let { page = 0, search, sort, ...filter } = req.query;
  const query = { page, filter };
  if (query.filter.writers) {// because equality does not work eg: sergio leon (srory), sergio leon (screenplay)
    query.search = query.filter.writers; //for paramsTitle
    const regexp = new RegExp('^' + query.filter.writers);
    query.filter = { writers: { $regex: regexp } };
  }
  if (sort) {
    if(sort === 'imdb.rating'){
      query.filter['imdb.rating'] = {$type: 'double'}
    }
    if (!res.locals.sort) {
      res.locals.sort = {};
    }
    if (page == 0) {
      req.session[sort] = req.session[sort] ? -req.session[sort] : -1;
      res.locals.sort[sort] = req.session[sort];
    }
    query.sort = { [sort]: req.session[sort] };
  }else{
    if (!res.locals.sort) {
      res.locals.sort = {};
    }
    req.session.title = 1;
    res.locals.sort.title = 1;
  }
  if (search) {
    const { match } = req.query;
    query.search = search;
    if (!/page/.test(req.url)) {
      query.url = req.url.concat('&page=0');
    }    
    let regexp;
    if(match !=='title' && search.split(/\s+/).length > 1){
      regexp = new RegExp(search+'|'+search.split(/\s+/).reverse().join(' '), 'i');
    }else{
      regexp = new RegExp(search, 'i');
    }
    query.filter = { $and: [{ $text: { $search: search } }, { [match]: { $regex: regexp } }]}
    query.projection = { score: { $meta: 'textScore' } };
    query.sort = { score: { $meta: 'textScore' } };   
  }
  return query;
}

module.exports = {
  getPages,
  formatTime,
  formatQuery
}