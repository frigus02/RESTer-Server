using Microsoft.AspNetCore.Authentication;

namespace RESTer.Server.Models.Sts
{
    public class LoginModel
    {
        public AuthenticationScheme[] AuthenticationSchemes { get; set; }

        public string ReturnUrl { get; set; }
    }
}
