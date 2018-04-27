using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace RESTer.Server.Utilities
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserId(this ClaimsPrincipal principal)
        {
            return principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
        }
    }
}
