# RESTer Server

This might become the server part for [RESTer](https://github.com/frigus02/RESTer),
a HTTP client browser extension. The idea is to let users synchronize requests
and the entire history. There could even be support for sharing requests between
members of a team.

## Develop

1.  Install dependencies

    ```sh
    yarn install
    ```

2.  Start local MongoDB

    ```sh
    docker run --name rester-db -p 27017:27017 -d mongo
    ```

3.  Generate a certificate for signing the JWTs

    ```sh
    openssl req \
        -x509 \
        -newkey rsa:2048 \
        -keyout new-oauth-cert.key \
        -out new-oauth-cert.crt \
        -days 9125 \
        -nodes \
        -subj "/O=RESTer/CN=rester.my-server.tld"
	node ./tools/env-from-certs.js
    ```

4.  Create a `.env` file containing the following variables

    ```sh
    RESTER_MONGO_DB_URL="mongodb://localhost:27017"
    RESTER_MONGO_DB_NAME="rester"
    RESTER_OAUTH2_PRIVATE_KEY=""
    RESTER_OAUTH2_PUBLIC_KEY=""
    RESTER_IDP_GOOGLE_CLIENT_ID=""
    RESTER_IDP_GOOGLE_CLIENT_SECRET=""
    ```

    Optional environment variables:

    ```sh
    PORT=3000
    RESTER_ENABLE_TRUST_PROXY=1
    ```

5.  Start server

    ```sh
    yarn start
    ```

## Build Docker image

1.  Build it

    ```sh
    docker build -t frigus02/rester-server .
    ```

2.  Test it

    ```sh
    docker run --name rester --rm -p 3000:80 --link rester-db -e "RESTER_MONGO_DB_URL=mongodb://rester-db:27017" -e "RESTER_MONGO_DB_NAME=rester" -e "RESTER_IDP_GOOGLE_CLIENT_ID=" -e "RESTER_IDP_GOOGLE_CLIENT_SECRET=" frigus02/rester-server
    ```
