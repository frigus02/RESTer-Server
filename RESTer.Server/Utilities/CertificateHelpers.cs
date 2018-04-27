using System;
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;

namespace RESTer.Server.Utilities
{
    public static class CertificateHelpers
    {
        public static X509Certificate2 CreateCertificateFromPfx(string pfx)
        {
            var pfxBytes = Convert.FromBase64String(pfx);
            return new X509Certificate2(pfxBytes);
        }

        public static RsaSecurityKey CreateIssuerSigningKey(X509Certificate2 certificate)
        {
            return new RsaSecurityKey(certificate.GetRSAPublicKey());
        }

        public static SigningCredentials CreateSigningCredentials(X509Certificate2 certificate)
        {
            var privateKey = new RsaSecurityKey(certificate.GetRSAPrivateKey());
            return new SigningCredentials(privateKey, SecurityAlgorithms.RsaSha256);
        }
    }
}
