using MongoDB.Bson;
using MongoDB.Driver;
using RESTer.Server.Repositories.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RESTer.Server.Repositories
{
    public class StsOAuth2RefreshTokenRepository : IStsOAuth2RefreshTokenRepository
    {
        private IMongoCollection<StsOAuth2RefreshToken> _collection;

        public StsOAuth2RefreshTokenRepository(IMongoDatabase db)
        {
            _collection = db.GetCollection<StsOAuth2RefreshToken>("sts-oauth2-refresh-tokens");
        }

        public async Task<StsOAuth2RefreshToken> CreateAsync(string clientId, string userId)
        {
            var token = new StsOAuth2RefreshToken
            {
                Id = Guid.NewGuid().ToString(),
                ClientId = clientId,
                UserId = userId
            };
            await _collection.InsertOneAsync(token);
            return token;
        }

        public async Task DeleteAllForClientAndUserAsync(string clientId, string userId)
        {
            var filter = Builders<StsOAuth2RefreshToken>.Filter.And(
                Builders<StsOAuth2RefreshToken>.Filter.Eq(t => t.ClientId, clientId),
                Builders<StsOAuth2RefreshToken>.Filter.Eq(t => t.UserId, userId)
            );
            await _collection.DeleteManyAsync(filter);
        }

        public async Task<StsOAuth2RefreshToken> GetAsync(string id)
        {
            var filter = Builders<StsOAuth2RefreshToken>.Filter.Eq(t => t.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<StsOAuth2RefreshToken>> QueryByUserIdAsync(string userId)
        {
            var filter = Builders<StsOAuth2RefreshToken>.Filter.Eq(t => t.UserId, userId);
            return await _collection.Find(filter).ToListAsync();
        }
    }
}
