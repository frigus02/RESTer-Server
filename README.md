# RESTer Server

This might become the server part for [RESTer](https://github.com/frigus02/RESTer),
a HTTP client browser extension. The idea is to let users synchronize requests
and the entire history. There could even be support for sharing requests between
members of a team.

## Develop

1.	Install dependencies

	```
	yarn install
	```

2.	Setup environment variables

	```posh
	$env:AZURE_STORAGE_CONNECTION_STRING = ""
	$env:RESTER_IDP_GOOGLE_CLIENT_ID = "";
	$env:RESTER_IDP_GOOGLE_CLIENT_SECRET = "";
	```

3.	Start server

	```
	yarn start
	```
