using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using RESTer.Server.Core.Models;

namespace RESTer.Server.Core
{
    public static class OAuth2UrlHelpers
    {
        private static string GetUri(string baseUrl, IDictionary<string, string> queryParams, OAuth2UrlParamLocation location)
        {
            var query = QueryString.Create(
                queryParams.Where(queryParam => queryParam.Value != null));

            var uriBuilder = new UriBuilder(baseUrl);
            if (location == OAuth2UrlParamLocation.Fragment)
            {
                uriBuilder.Fragment = query.ToString().TrimStart('?');
            }
            else
            {
                uriBuilder.Query = query.ToString().TrimStart('?');
            }

            return uriBuilder.Uri.ToString();
        }

        public static string GetAccessTokenRedirectUrl(
            string redirectUri,
            string accessToken,
            string tokenType,
            int? expiresIn,
            string state) =>
            GetUri(redirectUri, new Dictionary<string, string>
            {
                ["access_token"] = accessToken,
                ["token_type"] = tokenType,
                ["expires_in"] = expiresIn?.ToString(),
                ["state"] = state,
            }, OAuth2UrlParamLocation.Fragment);

        public static string GetCodeRedirectUrl(string redirectUri, string code, string state) =>
            GetUri(redirectUri, new Dictionary<string, string>
            {
                ["code"] = code,
                ["state"] = state,
            }, OAuth2UrlParamLocation.Query);

        public static string GetErrorRedirectUrl(
            string redirectUri,
            string error,
            string errorDescription,
            string state,
            OAuth2UrlParamLocation location) =>
            GetUri(redirectUri, new Dictionary<string, string>
            {
                ["error"] = error,
                ["error_description"] = errorDescription,
                ["state"] = state,
            }, location);
    }
}