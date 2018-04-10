# RESTer Server

This might become the server part for [RESTer](https://github.com/frigus02/RESTer),
a HTTP client browser extension. The idea is to let users synchronize requests
and the entire history. There could even be support for sharing requests between
members of a team.

## Develop

1.	Install dependencies

	```sh
	yarn install
	```

2.  Start local MongoDB

	```sh
	docker run --name rester-db -p 27017:27017 -d mongo
	```

2.	Create a `.env` file containing the following variables

	```posh
	RESTER_MONGO_DB_URL="mongodb://localhost:27017"
	RESTER_MONGO_DB_NAME="rester"
	RESTER_IDP_GOOGLE_CLIENT_ID=""
	RESTER_IDP_GOOGLE_CLIENT_SECRET=""
	```

3.	Start server

	```sh
	yarn start
	```
