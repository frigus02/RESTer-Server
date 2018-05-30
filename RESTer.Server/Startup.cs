using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MongoDB.Driver;
using RESTer.Server.Core;
using RESTer.Server.Core.Models;
using RESTer.Server.Repositories;
using RESTer.Server.Repositories.Models;
using RESTer.Server.Utilities;

namespace RESTer.Server
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // Config
            var cert = CertificateHelpers.CreateCertificateFromPfx(Configuration["RESTER_OAUTH2_CERTIFICATE"]);
            var issuer = "https://rester.kuehle.me";
            services.Configure<OAuth2Config>(config =>
            {
                config.ExpiresIn = 3600; // 1h
                config.Issuer = issuer;
                config.SigningCredentials = CertificateHelpers.CreateSigningCredentials(cert);
            });

            // Database
            var db = new MongoClient(Configuration["RESTER_MONGO_DB_URL"]);
            db.GetDatabase(Configuration["RESTER_MONGO_DB_NAME"]).SetupIndexes();
            services.AddSingleton<IMongoClient>(db);
            services.AddScoped<IMongoDatabase>(serviceProvider =>
                serviceProvider.GetService<IMongoClient>().GetDatabase(Configuration["RESTER_MONGO_DB_NAME"]));

            // Services
            services.AddTransient<IOAuth2Service, OAuth2Service>();

            // Repositories
            services.AddTransient<IStsOAuth2CodeRepository, StsOAuth2CodeRepository>();
            services.AddTransient<IStsOAuth2RefreshTokenRepository, StsOAuth2RefreshTokenRepository>();
            services.AddTransient<IUserRepository, UserRepository>();

            // Authentication MVC
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services
                .AddIdentityCore<User>(identityOptions => { })
                .AddUserStore<IdentityUserStore>()
                .AddSignInManager<SignInManager<User>>()
                .AddDefaultTokenProviders();
            services
                .AddAuthentication(authOptions =>
                {
                    authOptions.DefaultScheme = IdentityConstants.ApplicationScheme;
                    authOptions.DefaultSignInScheme = IdentityConstants.ExternalScheme;
                })
                .AddCookie(IdentityConstants.ApplicationScheme, cookieOptions =>
                {
                    cookieOptions.LoginPath = "/sts/login";
                })
                .AddCookie(IdentityConstants.ExternalScheme)
                .AddCookie(IdentityConstants.TwoFactorUserIdScheme) // Needed for SignInManager.SignOutAsync
                .AddGoogle(googleOptions =>
                {
                    googleOptions.ClientId = Configuration["RESTER_IDP_GOOGLE_CLIENT_ID"];
                    googleOptions.ClientSecret = Configuration["RESTER_IDP_GOOGLE_CLIENT_SECRET"];
                    googleOptions.CallbackPath = "/sts/callback/google";
                    googleOptions.ClaimActions.MapJsonSubKey("urn:rester:picture", "image", "url");
                });

            // Authentication WebAPI
            services
                .AddAuthentication()
                .AddJwtBearer(jwtBearerOptions =>
                {
                    jwtBearerOptions.TokenValidationParameters.IssuerSigningKey = CertificateHelpers.CreateIssuerSigningKey(cert);
                    jwtBearerOptions.TokenValidationParameters.ValidAudience = "rester";
                    jwtBearerOptions.TokenValidationParameters.ValidIssuer = issuer;

                    var validator = (JwtSecurityTokenHandler)jwtBearerOptions.SecurityTokenValidators[0];
                    validator.MapInboundClaims = false;
                });

            // MVC
            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseMvc(routes =>
            {
                routes.MapRoute("default", "{controller=Home}/{action=Index}");
            });
        }
    }
}
