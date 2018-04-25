namespace RESTer.Server.Core.Models
{
    public class OAuth2AccessToken
    {
        public string AccessToken { get; set; }

        public string TokenType { get; set; }

        public int ExpiresIn { get; set; }
    }
}
