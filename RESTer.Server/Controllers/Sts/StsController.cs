using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RESTer.Server.Models.Sts;
using RESTer.Server.Repositories.Models;

namespace RESTer.Server.Controllers.Sts
{
    [Route("sts/[action]")]
    public class StsController : Controller
    {
        private SignInManager<User> _signInManager;
        private UserManager<User> _userManager;

        public StsController(SignInManager<User> signInManager, UserManager<User> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Login([FromQuery] string idp, [FromQuery] string returnUrl)
        {
            if (string.IsNullOrEmpty(idp))
            {
                var schemes = await _signInManager.GetExternalAuthenticationSchemesAsync();
                return View(new LoginModel
                {
                    AuthenticationSchemes = schemes.ToArray(),
                    ReturnUrl = returnUrl
                });
            }
            else
            {
                var redirectUrl = Url.Action(nameof(Callback), new { ReturnUrl = returnUrl });
                var properties = _signInManager.ConfigureExternalAuthenticationProperties(idp, redirectUrl);
                return Challenge(properties, idp);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Callback([FromQuery] string returnUrl)
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);
            if (result.Succeeded)
            {
                return LocalRedirect(returnUrl);
            }

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var user = await _userManager.FindByNameAsync(email);
            if (user != null)
            {
                await _userManager.AddLoginAsync(user, info);
                await _signInManager.SignInAsync(user, isPersistent: false);

                return LocalRedirect(returnUrl);
            }

            return View("Register", new RegisterModel
            {
                GivenName = info.Principal.FindFirstValue(ClaimTypes.GivenName),
                FamilyName = info.Principal.FindFirstValue(ClaimTypes.Surname),
                DisplayName = info.Principal.FindFirstValue(ClaimTypes.Name),
                Email = email,
                PictureUrl = new Uri(info.Principal.FindFirstValue("urn:rester:picture")),
                Idp = info.LoginProvider,
                ReturnUrl = returnUrl
            });
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromForm] RegisterModel model)
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            var user = new User
            {
                GivenName = model.GivenName,
                FamilyName = model.FamilyName,
                DisplayName = model.DisplayName,
                Street = model.Street,
                City = model.City,
                Zip = model.Zip,
                State = model.State,
                Country = model.Country,
                Email = info.Principal.FindFirstValue(ClaimTypes.Email),
                PictureUrl = new Uri(info.Principal.FindFirstValue("urn:rester:picture"))
            };

            await _userManager.CreateAsync(user);
            await _userManager.AddLoginAsync(user, info);
            await _signInManager.SignInAsync(user, isPersistent: false);

            return LocalRedirect(model.ReturnUrl);
        }

        [HttpGet]
        public async Task<IActionResult> Logout([FromQuery] string returnUrl)
        {
            await _signInManager.SignOutAsync();

            return LocalRedirect(returnUrl);
        }
    }
}
