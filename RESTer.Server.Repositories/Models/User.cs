using System;
using System.Collections.Generic;
using MongoDB.Bson;

namespace RESTer.Server.Repositories.Models
{
    public class User
    {
        public string Id { get; set; }

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

        public IEnumerable<Account> Accounts { get; set; } = new List<Account>();
    }
}
