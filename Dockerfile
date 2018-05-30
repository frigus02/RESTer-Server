FROM microsoft/dotnet:2.1-aspnetcore-runtime

WORKDIR /app
COPY RESTer.Server/publish/ .

ENTRYPOINT ["dotnet", "RESTer.Server.dll"]
