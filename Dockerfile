FROM microsoft/aspnetcore:2.0.7

WORKDIR /app
COPY RESTer.Server/publish/ .

ENTRYPOINT ["dotnet", "RESTer.Server.dll"]
