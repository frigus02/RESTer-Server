using MongoDB.Bson;
using MongoDB.Driver;
using RESTer.Server.Repositories.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RESTer.Server.Repositories
{
    public class UserRepository : IUserRepository
    {
        private IMongoCollection<User> _collection;

        public UserRepository(IMongoDatabase db)
        {
            _collection = db.GetCollection<User>("users");
        }

        public async Task CreateAsync(User user)
        {
            user.Id = Guid.NewGuid().ToString();
            user.Email = user.Email.ToLowerInvariant();
            await _collection.InsertOneAsync(user);
        }

        public async Task<User> GetAsync(string id)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Email, email.ToLowerInvariant());
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<User> GetByAccountAsync(Account account)
        {
            var filter = Builders<User>.Filter.AnyEq(u => u.Accounts, account);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task UpdateAsync(User user)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            var update = Builders<User>.Update
                .Set(u => u.GivenName, user.GivenName)
                .Set(u => u.FamilyName, user.FamilyName)
                .Set(u => u.DisplayName, user.DisplayName)
                .Set(u => u.Street, user.Street)
                .Set(u => u.City, user.City)
                .Set(u => u.Zip, user.Zip)
                .Set(u => u.State, user.State)
                .Set(u => u.Country, user.Country)
                .Set(u => u.PictureUrl, user.PictureUrl);
            await _collection.UpdateOneAsync(filter, update);
        }

        public async Task UpdateAccountsAsync(string userId, IEnumerable<Account> accounts)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update
                .Set(u => u.Accounts, accounts);
            await _collection.UpdateOneAsync(filter, update);
        }
    }
}
