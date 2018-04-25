using MongoDB.Bson;
using RESTer.Server.Repositories.Models;
using System;
using System.Threading.Tasks;

namespace RESTer.Server.Repositories
{
    public interface IStsOAuth2CodeRepository
    {
        Task<StsOAuth2Code> CreateAsync(string clientId, string redirectUri, string userId);

        Task<StsOAuth2Code> GetAndDeleteAsync(string id);
    }
}
