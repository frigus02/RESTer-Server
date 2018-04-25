using MongoDB.Driver;
using RESTer.Server.Repositories.Models;
using System.Collections.Generic;

namespace RESTer.Server.Repositories
{
    public static class Setup
    {
        public static void SetupIndexes(this IMongoDatabase db)
        {
            var indexes = new List<CreateIndexModel<User>>();
            indexes.Add(new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true }));
            indexes.Add(new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Accounts),
                new CreateIndexOptions { Unique = true }));
            db.GetCollection<User>("users").Indexes.CreateMany(indexes);
        }
    }
}
