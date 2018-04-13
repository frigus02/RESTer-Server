(function() {
    'use strict';

    const sectionLogin = document.getElementById('login');
    const sectionLoginError = document.getElementById('loginError');
    const sectionAccount = document.getElementById('account');

    handleLoginResult();

    function handleLoginResult() {
        const loginResult = window.location.hash;
        if (loginResult) {
            const params = new URLSearchParams(loginResult.substr(1));
            if (params.has('error')) {
                const error = params.get('error');
                const description = params.get('error_description');
                sectionLoginError.hidden = false;
                sectionLoginError.querySelector(
                    'div'
                ).textContent = `${error}; ${description}`;
            } else if (params.has('access_token')) {
                const token = params.get('access_token');
                window.sessionStorage.setItem('token', token);
            }

            window.history.pushState(null, null, '/');
        }

        const token = window.sessionStorage.getItem('token');
        if (token) {
            sectionLogin.hidden = true;
            sectionAccount.hidden = false;
            loadUserProfile(token);
        }
    }

    async function loadUserProfile(token) {
        const res = await fetch('/api/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const user = await res.json();

        document.getElementById('accountPicture').src = user.pictureUrl;
        document.getElementById('accountGivenName').textContent =
            user.givenName;
        document.getElementById('accountFamilyName').textContent =
            user.familyName;
        document.getElementById('accountDisplayName').textContent =
            user.displayName;
        document.getElementById('accountStreet').textContent = user.street;
        document.getElementById('accountCity').textContent = user.city;
        document.getElementById('accountZip').textContent = user.zip;
        document.getElementById('accountState').textContent = user.state;
        document.getElementById('accountCountry').textContent = user.country;
        document.getElementById('accountEmail').textContent = user.email;
    }
})();
