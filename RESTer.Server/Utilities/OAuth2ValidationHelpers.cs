using Microsoft.AspNetCore.Http;

namespace RESTer.Server.Utilities
{
    public static class OAuth2ValidationHelpers
    {
        public static bool ValidateClient(HttpRequest request, string clientId, string redirectUri) =>
            //clientId == "rester" && redirectUri == $"{request.Scheme}://{request.Host}/images/favicon.png";
            clientId == "rester" && redirectUri == $"{request.Scheme}://localhost/images/favicon.png";

        public static bool ValidateClientAuth(string clientId, string clientSecret) =>
            clientId == "rester" && clientSecret == "fk6GtWcmJZKx6N6u";
    }
}
