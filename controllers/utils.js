function getPages(currentPage, count, limit) {
  let pages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (currentPage > 4) {
    pages = pages.map(n => n + currentPage - 4);
  }
  return pages.filter(x => x * limit < count);
}

function formatTime(runtime) {
  if(!runtime){
    return
  }
  runtime = parseInt(runtime)
  let hour = Math.trunc(runtime / 60);
  let minute = runtime - hour * 60;
  hour = hour > 10 ? hour : "0" + hour;
  minute = minute > 10 ? minute : "0" + minute;
  return `${hour}h:${minute}min`;
}

function formatQuery(req, res) {
  let { page, search, sort, order, ...filter } = req.query;
  const query = { page, filter };
  const {writers, cast, directors}   = {...filter}
  res.locals.people = writers || cast || directors;// for wikipedia
  if (writers) {
    // because equality does not work eg: sergio leon (srory), sergio leon (screenplay)
    query.search = writers; //for paramsTitle
    const regexp = new RegExp("^" + writers);
    query.filter = { writers: { $regex: regexp } };
  }
  if (sort) {
    if (sort === "imdb.rating" && filter.type) {
      query.filter["imdb.rating"] = { $gt: 0 };
    }
    query.sort = { [sort]: order };
  } else {
    query.sort = { title: 1 };
  }
  if (search) {
    const { match } = req.query;
    query.search = search;
    // if (!/page/.test(req.url)) {
    //   query.url = req.url.concat("&page=0");
    // }
    let regexp;
    if (match !== "all" /*&& search.split(/\s+/).length > 1*/) {
      regexp = new RegExp(
        search +
          "|" +
          search
            .split(/\s+/)
            .reverse()
            .join(" "),
        "i"
      );
      query.filter = {
        $and: [{ $text: { $search: search } }, { [match]: { $regex: regexp } }]
      };
      // console.log(query.filter['$and'])
    } else {
      query.filter = { $text: { $search: search } }
    }
   
    query.score = { $meta: "textScore" };
    query.sort = { score: { $meta: "textScore" } };
    
  }
  return query;
}

module.exports = {
  getPages,
  formatTime,
  formatQuery
};
