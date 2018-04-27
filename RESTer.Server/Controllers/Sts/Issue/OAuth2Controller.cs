using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RESTer.Server.Core;
using RESTer.Server.Core.Models;
using RESTer.Server.Models;
using RESTer.Server.Repositories;
using RESTer.Server.Repositories.Models;
using RESTer.Server.Utilities;

namespace RESTer.Server.Controllers.Sts.Issue
{
    [Route("sts/issue/oauth2/[action]")]
    public class OAuth2Controller : Controller
    {
        private static readonly HashSet<string> SupportedResponseTypes = new HashSet<string>(
            new[] { "code", "token" },
            StringComparer.OrdinalIgnoreCase);

        private readonly UserManager<User> _userManager;
        private readonly IOAuth2Service _oAuth2Service;
        private readonly IStsOAuth2CodeRepository _stsOAuth2CodeRepository;
        private readonly IStsOAuth2RefreshTokenRepository _stsOAuth2RefreshTokenRepository;

        public OAuth2Controller(
            UserManager<User> userManager,
            IOAuth2Service oAuth2Service,
            IStsOAuth2CodeRepository stsOAuth2CodeRepository,
            IStsOAuth2RefreshTokenRepository stsOAuth2RefreshTokenRepository)
        {
            _userManager = userManager;
            _oAuth2Service = oAuth2Service;
            _stsOAuth2CodeRepository = stsOAuth2CodeRepository;
            _stsOAuth2RefreshTokenRepository = stsOAuth2RefreshTokenRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Authorize(
            [FromQuery(Name = "response_type")] string responseType,
            [FromQuery(Name = "client_id")] string clientId,
            [FromQuery(Name = "redirect_uri")] string redirectUri,
            [FromQuery(Name = "state")] string state)
        {
            if (!OAuth2ValidationHelpers.ValidateClient(Request, clientId, redirectUri))
            {
                return BadRequest("Invalid client_id or redirect_uri.");
            }

            var urlParamLocation = "code".Equals(responseType, StringComparison.OrdinalIgnoreCase)
                ? OAuth2UrlParamLocation.Query
                : OAuth2UrlParamLocation.Fragment;
            if (!SupportedResponseTypes.Contains(responseType))
            {
                return Redirect(OAuth2UrlHelpers.GetErrorRedirectUrl(
                    redirectUri,
                    "unsupported_response_type",
                    null,
                    state,
                    urlParamLocation));
            }

            if (!User.Identity.IsAuthenticated)
            {
                return Challenge();
            }

            var userId = _userManager.GetUserId(User);
            if ("code".Equals(responseType, StringComparison.OrdinalIgnoreCase))
            {
                var stsCode = await _stsOAuth2CodeRepository.CreateAsync(
                    clientId,
                    redirectUri,
                    userId);

                return Redirect(OAuth2UrlHelpers.GetCodeRedirectUrl(
                    redirectUri,
                    stsCode.Id.ToString(),
                    state));
            }
            else
            {
                var token = _oAuth2Service.GenerateAccessToken(userId, clientId);

                return Redirect(OAuth2UrlHelpers.GetAccessTokenRedirectUrl(
                    redirectUri,
                    token.AccessToken,
                    token.TokenType,
                    token.ExpiresIn,
                    state));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Token(
            [FromHeader(Name = "Authorization")] string authorization,
            [FromForm(Name = "grant_type")] string grantType,
            [FromForm(Name = "code")] string code,
            [FromForm(Name = "redirect_uri")] string redirectUri,
            [FromForm(Name = "refresh_token")] string refreshToken)
        {
            if (authorization == null || !authorization.StartsWith("basic ", StringComparison.OrdinalIgnoreCase))
            {
                return JsonWithStatus(401, new
                {
                    error = "invalid_client",
                    error_description = "No authentication found, only HTTP Basic authentication is supported"
                });
            }

            var authToken = Encoding.UTF8.GetString(Convert.FromBase64String(authorization.Substring(6)));
            var authTokenParts = authToken.Split(':');
            var clientId = WebUtility.UrlDecode(authTokenParts[0]);
            var clientSecret = WebUtility.UrlDecode(authTokenParts[1]);
            if (!OAuth2ValidationHelpers.ValidateClientAuth(clientId, clientSecret))
            {
                return JsonWithStatus(401, new
                {
                    error = "invalid_client",
                    error_description = "Invalid client_id or client_secret"
                });
            }

            if ("authorization_code".Equals(grantType, StringComparison.OrdinalIgnoreCase))
            {
                if (code == null || redirectUri == null)
                {
                    return JsonWithStatus(400, new
                    {
                        error = "invalid_request",
                        error_description = "Missing parameter: code or redirect_uri"
                    });
                }

                var stsCode = await _stsOAuth2CodeRepository.GetAndDeleteAsync(code);
                if (stsCode == null || stsCode.ClientId != clientId || stsCode.RedirectUri != redirectUri)
                {
                    return JsonWithStatus(400, new
                    {
                        error = "invalid_grant"
                    });
                }

                var token = _oAuth2Service.GenerateAccessToken(stsCode.UserId, clientId);
                var stsRefreshToken = await _stsOAuth2RefreshTokenRepository.CreateAsync(clientId, stsCode.UserId);

                return Json(new
                {
                    access_token = token.AccessToken,
                    token_type = token.TokenType,
                    expires_in = token.ExpiresIn,
                    refresh_token = stsRefreshToken.Id
                });
            }
            else if ("refresh_token".Equals(grantType, StringComparison.OrdinalIgnoreCase))
            {
                if (refreshToken == null)
                {
                    return JsonWithStatus(400, new
                    {
                        error = "invalid_request",
                        error_description = "Missing parameter: refresh_token"
                    });
                }

                var stsRefreshToken = await _stsOAuth2RefreshTokenRepository.GetAsync(refreshToken);
                if (stsRefreshToken == null || stsRefreshToken.ClientId != clientId)
                {
                    return JsonWithStatus(400, new
                    {
                        error = "invalid_grant"
                    });
                }

                var token = _oAuth2Service.GenerateAccessToken(stsRefreshToken.UserId, clientId);

                return Json(new
                {
                    access_token = token.AccessToken,
                    token_type = token.TokenType,
                    expires_in = token.ExpiresIn
                });
            }
            else
            {
                return JsonWithStatus(400, new
                {
                    error = "unsupported_grant_type"
                });
            }
        }

        private JsonResult JsonWithStatus(int statusCode, object values)
        {
            var result = new JsonResult(values);
            result.StatusCode = statusCode;
            return result;
        }
    }
}
