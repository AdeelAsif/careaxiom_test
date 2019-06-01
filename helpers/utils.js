const querystring = require("querystring");
const request = require("request");
const cheerio = require("cheerio");
const async = require("async");
const { Observable, from } = require("rxjs");
const { mergeMap, toArray } = require("rxjs/operators");

function parsQueryParams(query) {
  const parsedParams = querystring.parse(query);
  Object.keys(parsedParams).forEach(key => {
    const value = parsedParams[key] || [];
    parsedParams[key] = Array.isArray(value) ? value : [value];
  });
  return parsedParams;
}

function fetchUsingCallbacks(urls, cb) {
  const titles = [];

  urls.forEach(url => {
    request(`http://${url}`, function(error, response, body) {
      let webpageTitle = "No Response";

      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(body);
        webpageTitle = $("title").text();
      }

      titles.push(`${url} - ${webpageTitle}`);

      if (titles.length === urls.length) {
        cb(null, titles);
      }
    });
  });
}

function fetchUsingAsync(urls, cb) {
  const titles = [];

  async.forEachOf(
    urls,
    (url, key, callback) => {
      request(`http://${url}`, function(error, response, body) {
        let webpageTitle = "No Response";

        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(body);
          webpageTitle = $("title").text();
        }

        titles.push(`${url} - ${webpageTitle}`);

        callback();
      });
    },
    err => {
      if (err) console.error(err.message);
      cb(null, titles);
    }
  );
}

function fetchUsingPromises(urls, cb) {
  const requestFetchPromise = function(url) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      request(`http://${url}`, (err, response, body) => {
        let webpageTitle = "No Response";
        if (!err) {
          const $ = cheerio.load(body);
          webpageTitle = $("title").text();
        }
        resolve(`${url} - ${webpageTitle}`);
      });
    });
  };

  Promise.all(urls.map(requestFetchPromise)).then(titles => {
    cb(null, titles);
  });
}

function fetchUsingRx(urls, cb) {
  const makeHttpCall = url =>
    Observable.create(observer => {
      request(`http://${url}`, (err, response, body) => {
        let webpageTitle = "No Response";
        if (!err) {
          const $ = cheerio.load(body);
          webpageTitle = $("title").text();
        }
        observer.next(`${url} - ${webpageTitle}`);
        observer.complete();
      });
    });

  from(urls)
    .pipe(
      mergeMap(url => makeHttpCall(url)),
      toArray()
    )
    .subscribe(titles => cb(null, titles));
}

module.exports = {
  parsQueryParams,
  fetchUsingCallbacks,
  fetchUsingAsync,
  fetchUsingPromises,
  fetchUsingRx
};
