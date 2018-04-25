using RESTer.Server.Core.Models;

namespace RESTer.Server.Core
{
    public interface IOAuth2Service
    {
        OAuth2AccessToken GenerateAccessToken(string userId, string clientId);
    }
}
