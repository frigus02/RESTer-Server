using MongoDB.Bson;
using MongoDB.Driver;
using RESTer.Server.Repositories.Models;
using System;
using System.Threading.Tasks;

namespace RESTer.Server.Repositories
{
    public class StsOAuth2CodeRepository : IStsOAuth2CodeRepository
    {
        private const int DefaultValidForMillis = 1000 * 60 * 5;

        private IMongoCollection<StsOAuth2Code> _collection;

        public StsOAuth2CodeRepository(IMongoDatabase db)
        {
            _collection = db.GetCollection<StsOAuth2Code>("sts-oauth2-codes");
        }

        public async Task<StsOAuth2Code> CreateAsync(string clientId, string redirectUri, string userId)
        {
            var code = new StsOAuth2Code
            {
                Id = Guid.NewGuid().ToString(),
                Expires = DateTime.UtcNow.AddMilliseconds(DefaultValidForMillis),
                ClientId = clientId,
                RedirectUri = redirectUri,
                UserId = userId
            };
            await _collection.InsertOneAsync(code);
            return code;
        }

        public async Task<StsOAuth2Code> GetAndDeleteAsync(string id)
        {
            var filter = Builders<StsOAuth2Code>.Filter.Eq(c => c.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }
    }
}
