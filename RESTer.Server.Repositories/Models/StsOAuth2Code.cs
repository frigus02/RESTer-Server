using System;
using MongoDB.Bson;

namespace RESTer.Server.Repositories.Models
{
    public class StsOAuth2Code
    {
        public string Id { get; set; }

        public DateTime Expires { get; set; }

        public string ClientId { get; set; }

        public string RedirectUri { get; set; }

        public string UserId { get; set; }
    }
}
