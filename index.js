const url = require('url');
const querystring = require('querystring');
const request = require('request');
const cheerio = require('cheerio');

const http = require('http');

const server = http.createServer((req, res) => {
  req.parsedUrl = url.parse(req.url);
  let { pathname } = req.parsedUrl;

  if (pathname === '/I/want/title' && req.method === 'GET') {
    handlePageQuery(req, res);
  } else {
    handleError(req, res);
  }
});

server.listen(8080, () => {});

function handlePageQuery(req, res) {
  let parsedParams = querystring.parse(req.parsedUrl.query);
  let urls = parsedParams.address;
  let titles = [];

  urls.forEach((url, index) => {
    request('http://' + url, function(error, response, body) {
      let webpageTitle = 'No Response';
			
			if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        webpageTitle = $('title').text();
      }

      titles.push(url + ' - ' + webpageTitle);

      if (titles.length == urls.length) {
        const response = `<html>
					<head></head>
							<body>
							<h1> Following are the titles of given websites: </h1>
							<ul>
								${titles.reduce((acc, title) => acc + `<li>${title}</li>`, '')}
							</ul>
					</body>
					</html>`;

        res.end(response);
      }
    });
  });
}

function handleError(req, res) {
  res.statusCode = 404;
  res.end('404: File Not Found');
}
