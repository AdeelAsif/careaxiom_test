function handleError(req, res) {
  res.statusCode = 404;
  res.end('404: File Not Found');
}

function renderResponse(titles) {
  const listItems =
    titles && titles.length ? titles.reduce((acc, title) => acc + `<li>${title}</li>`, '') : '';

  const response = `<html>
		<head></head>
				<body>
				<h1> Following are the titles of given websites: </h1>				
					<ul>
					${listItems}
					</ul>
		</body>
		</html>`;
  return response;
}

module.exports = {
  handleError,
  renderResponse
};
