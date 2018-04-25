using MongoDB.Bson;
using RESTer.Server.Repositories.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RESTer.Server.Repositories
{
    public interface IUserRepository
    {
        Task CreateAsync(User user);

        Task<User> GetAsync(string id);

        Task<User> GetByEmailAsync(string email);

        Task<User> GetByAccountAsync(Account account);

        Task UpdateAsync(User user);

        Task UpdateAccountsAsync(string userId, IEnumerable<Account> accounts);
    }
}
