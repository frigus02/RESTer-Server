using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using RESTer.Server.Repositories;
using RESTer.Server.Repositories.Models;

namespace RESTer.Server.Utilities
{
    public class IdentityUserStore : IUserLoginStore<User>
    {
        private IUserRepository _userRepository;

        public IdentityUserStore(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task AddLoginAsync(User user, UserLoginInfo login, CancellationToken cancellationToken)
        {
            var accounts = user.Accounts.Append(new Account
            {
                Idp = login.LoginProvider,
                Name = login.ProviderKey
            });
            await _userRepository.UpdateAccountsAsync(user.Id, accounts);
        }

        public async Task<IdentityResult> CreateAsync(User user, CancellationToken cancellationToken)
        {
            try
            {
                await _userRepository.CreateAsync(user);
                return IdentityResult.Success;
            }
            catch (Exception e)
            {
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "server_error",
                    Description = e.Message
                });
            }
        }

        public Task<IdentityResult> DeleteAsync(User user, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public async Task<User> FindByIdAsync(string userId, CancellationToken cancellationToken)
        {
            return await _userRepository.GetAsync(userId);
        }

        public async Task<User> FindByLoginAsync(string loginProvider, string providerKey, CancellationToken cancellationToken)
        {
            return await _userRepository.GetByAccountAsync(new Account
            {
                Idp = loginProvider,
                Name = providerKey
            });
        }

        public async Task<User> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
        {
            return await _userRepository.GetByEmailAsync(normalizedUserName);
        }

        public Task<IList<UserLoginInfo>> GetLoginsAsync(User user, CancellationToken cancellationToken)
        {
            var loginInfoList = user.Accounts
                .Select(account => new UserLoginInfo(account.Idp, account.Name, account.Name))
                .ToList();

            return Task.FromResult<IList<UserLoginInfo>>(loginInfoList);
        }

        public Task<string> GetNormalizedUserNameAsync(User user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Email.ToUpperInvariant());
        }

        public Task<string> GetUserIdAsync(User user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Id);
        }

        public Task<string> GetUserNameAsync(User user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Email);
        }

        public async Task RemoveLoginAsync(User user, string loginProvider, string providerKey, CancellationToken cancellationToken)
        {
            var accounts = user.Accounts.Where(account => !(account.Idp == loginProvider && account.Name == providerKey));
            await _userRepository.UpdateAccountsAsync(user.Id, accounts);
        }

        public Task SetNormalizedUserNameAsync(User user, string normalizedName, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task SetUserNameAsync(User user, string userName, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public async Task<IdentityResult> UpdateAsync(User user, CancellationToken cancellationToken)
        {
            try
            {
                await _userRepository.UpdateAsync(user);
                return IdentityResult.Success;
            }
            catch (Exception e)
            {
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "server_error",
                    Description = e.Message
                });
            }
        }

        public void Dispose()
        {
        }
    }
}
