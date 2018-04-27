using Microsoft.Extensions.Options;
using RESTer.Server.Core.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace RESTer.Server.Core
{
    public class OAuth2Service : IOAuth2Service
    {
        private readonly OAuth2Config _config;

        public OAuth2Service(IOptions<OAuth2Config> configAccessor)
        {
            _config = configAccessor.Value;
        }

        public OAuth2AccessToken GenerateAccessToken(string userId, string clientId)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId)
            };

            var token = new JwtSecurityToken(
                issuer: _config.Issuer,
                audience: clientId,
                claims: claims,
                expires: DateTime.Now.AddSeconds(_config.ExpiresIn),
                signingCredentials: _config.SigningCredentials);

            return new OAuth2AccessToken
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                TokenType = "urn:ietf:params:oauth:token-type:jwt",
                ExpiresIn = _config.ExpiresIn
            };
        }
    }
}
