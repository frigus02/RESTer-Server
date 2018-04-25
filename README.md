# RESTer Server

This might become the server part for [RESTer](https://github.com/frigus02/RESTer),
a HTTP client browser extension. The idea is to let users synchronize requests
and the entire history. There could even be support for sharing requests between
members of a team.

## Develop

### Initial setup

1.  Generate a certificate for signing the JWTs

    ```sh
    # Generate private and public key
    openssl req \
        -x509 \
        -newkey rsa:2048 \
        -keyout new-oauth-key.pem \
        -out new-oauth-cert.pem \
        -days 9125 \
        -nodes \
        -subj "/O=RESTer/CN=rester.my-server.tld"
    # Combine them to a PFX file
    openssl pkcs12 \
        -in new-oauth-cert.pem \
        -inkey new-oauth-key.pem \
        -export \
        -out new-oauth-cert.pfx
    ```

    Convert PFX to Base64

    ```posh
    [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("C:/path/to/new-oauth-cert.pfx"))
    ```

2.  Store environment variables in the [Secret Manager](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-2.1&tabs=visual-studio-code#secret-manager):

    ```sh
    cd RESTer.Server
    dotnet user-secrets set RESTER_MONGO_DB_URL mongodb://localhost:27017
    dotnet user-secrets set RESTER_MONGO_DB_NAME rester
    dotnet user-secrets set RESTER_OAUTH2_CERTIFICATE <base64 encoded pfx certificate>
    dotnet user-secrets set RESTER_IDP_GOOGLE_CLIENT_ID <google oauth2 client id>
    dotnet user-secrets set RESTER_IDP_GOOGLE_CLIENT_SECRET <google oauth2 client secret>
    ```

### Start development

1.  Start local MongoDB

    ```sh
    docker run --name rester-db -p 27017:27017 -d mongo
    ```

1.  Start server

    ```sh
    ASPNETCORE_ENVIRONMENT=Development dotnet run RESTer.Server/RESTer.Server.csproj
    # Or
    cd RESTer.Server
    ASPNETCORE_ENVIRONMENT=Development dotnet watch run
    ```

## Build Docker image

1.  Build it

    ```sh
    dotnet publish -c Release -o publish RESTer.Server/RESTer.Server.csproj
    docker build -t frigus02/rester-server .
    ```

2.  Test it

    ```posh
    docker run `
        --name rester `
        --rm `
        -p 80:80 `
        --link rester-db `
        -e "RESTER_MONGO_DB_URL=mongodb://rester-db:27017" `
        -e "RESTER_MONGO_DB_NAME=rester" `
        -e "RESTER_OAUTH2_CERTIFICATE=" `
        -e "RESTER_IDP_GOOGLE_CLIENT_ID=" `
        -e "RESTER_IDP_GOOGLE_CLIENT_SECRET=" `
        frigus02/rester-server
    ```
