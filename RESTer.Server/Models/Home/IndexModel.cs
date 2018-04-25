using System;
using System.Collections.Generic;
using RESTer.Server.Repositories.Models;

namespace RESTer.Server.Models.Home
{
    public class IndexModel
    {
        public string GivenName { get; set; }

        public string FamilyName { get; set; }

        public string DisplayName { get; set; }

        public string Street { get; set; }

        public string City { get; set; }

        public string Zip { get; set; }

        public string State { get; set; }

        public string Country { get; set; }

        public string Email { get; set; }

        public Uri PictureUrl { get; set; }

        public string[] AuthorizedClients { get; set; }

        public bool IsEditMode { get; set; }
    }
}
