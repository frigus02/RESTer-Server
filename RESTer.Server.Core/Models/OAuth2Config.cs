using Microsoft.IdentityModel.Tokens;

namespace RESTer.Server.Core.Models
{
    public class OAuth2Config
    {
        /// <summary>
        /// Expiration time of generated tokens in seconds.
        /// </summary>
        public int ExpiresIn { get; set; }

        public string Issuer { get; set; }

        public SigningCredentials SigningCredentials { get; set; }
    }
}
