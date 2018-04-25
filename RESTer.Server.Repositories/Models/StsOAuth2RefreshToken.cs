using MongoDB.Bson;

namespace RESTer.Server.Repositories.Models
{
    public class StsOAuth2RefreshToken
    {
        public string Id { get; set; }

        public string ClientId { get; set; }

        public string UserId { get; set; }
    }
}
