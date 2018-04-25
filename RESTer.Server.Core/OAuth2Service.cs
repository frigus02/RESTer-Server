using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RESTer.Server.Core.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;

namespace RESTer.Server.Core
{
    public class OAuth2Service : IOAuth2Service
    {
        private RsaSecurityKey _issuerSigningKey;
        private SigningCredentials _signingCredentials;

        public OAuth2Service(IConfiguration configuration)
        {
            var pfxBytes = Convert.FromBase64String(configuration["RESTER_OAUTH2_CERTIFICATE"]);
            var cert = new X509Certificate2(pfxBytes);

            _issuerSigningKey = new RsaSecurityKey(cert.GetRSAPublicKey());

            var privateKey = new RsaSecurityKey(cert.GetRSAPrivateKey());
            _signingCredentials = new SigningCredentials(privateKey, SecurityAlgorithms.RsaSha256);
        }

        public OAuth2AccessToken GenerateAccessToken(string userId, string clientId)
        {
            var expiresIn = 60 * 60; // 1h
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId)
            };

            var token = new JwtSecurityToken(
                issuer: "https://rester.kuehle.me",
                audience: clientId,
                claims: claims,
                expires: DateTime.Now.AddSeconds(expiresIn),
                signingCredentials: _signingCredentials);

            return new OAuth2AccessToken
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                TokenType = "urn:ietf:params:oauth:token-type:jwt",
                ExpiresIn = expiresIn
            };
        }
    }
}
