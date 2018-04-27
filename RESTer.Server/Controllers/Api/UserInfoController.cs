using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RESTer.Server.Models.Api;
using RESTer.Server.Repositories;
using RESTer.Server.Repositories.Models;
using RESTer.Server.Utilities;

namespace RESTer.Server.Controllers.Api
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UserInfoController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserInfoController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        [Route("api/userinfo")]
        public async Task<UserInfoModel> GetUserInfo()
        {
            var user = await _userRepository.GetAsync(User.GetUserId());
            return new UserInfoModel
            {
                GivenName = user.GivenName,
                FamilyName = user.FamilyName,
                DisplayName = user.DisplayName,
                Street = user.Street,
                City = user.City,
                Zip = user.Zip,
                State = user.State,
                Country = user.Country,
                Email = user.Email,
                PictureUrl = user.PictureUrl
            };
        }
    }
}
