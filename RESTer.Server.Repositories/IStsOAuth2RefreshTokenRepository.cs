using MongoDB.Bson;
using RESTer.Server.Repositories.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RESTer.Server.Repositories
{
    public interface IStsOAuth2RefreshTokenRepository
    {
        Task<StsOAuth2RefreshToken> CreateAsync(string clientId, string userId);

        Task<StsOAuth2RefreshToken> GetAsync(string id);

        Task<IEnumerable<StsOAuth2RefreshToken>> QueryByUserIdAsync(string userId);

        Task DeleteAllForClientAndUserAsync(string clientId, string userId);
    }
}
