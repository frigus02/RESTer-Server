using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using RESTer.Server.Models.Home;
using RESTer.Server.Repositories;
using RESTer.Server.Repositories.Models;

namespace RESTer.Server.Controllers
{
    public class HomeController : Controller
    {
        private SignInManager<User> _signInManager;
        private UserManager<User> _userManager;
        private IStsOAuth2RefreshTokenRepository _stsOAuth2RefreshTokenRepository;

        public HomeController(
            SignInManager<User> signInManager,
            UserManager<User> userManager,
            IStsOAuth2RefreshTokenRepository stsOAuth2RefreshTokenRepository)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _stsOAuth2RefreshTokenRepository = stsOAuth2RefreshTokenRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var model = new IndexModel();
            if (User.Identity.IsAuthenticated)
            {
                var user = await _userManager.GetUserAsync(User);
                model.GivenName = user.GivenName;
                model.FamilyName = user.FamilyName;
                model.DisplayName = user.DisplayName;
                model.Street = user.Street;
                model.City = user.City;
                model.Zip = user.Zip;
                model.State = user.State;
                model.Country = user.Country;
                model.Email = user.Email;
                model.PictureUrl = user.PictureUrl;

                var tokens = await _stsOAuth2RefreshTokenRepository.QueryByUserIdAsync(user.Id);
                model.AuthorizedClients = tokens.Select(token => token.ClientId).Distinct().ToArray();

                model.IsEditMode = Request.Query.ContainsKey("editaccount");
            }

            return View(model);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UpdateAccount([FromForm] IndexModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            user.GivenName = model.GivenName;
            user.FamilyName = model.FamilyName;
            user.DisplayName = model.DisplayName;
            user.Street = model.Street;
            user.City = model.City;
            user.Zip = model.Zip;
            user.State = model.State;
            user.Country = model.Country;
            await _userManager.UpdateAsync(user);

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> RevokeClientAccess([FromForm] string clientId)
        {
            var userId = _userManager.GetUserId(User);
            await _stsOAuth2RefreshTokenRepository.DeleteAllForClientAndUserAsync(clientId, userId);

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult Error()
        {
            return View(new ErrorModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
            });
        }
    }
}
