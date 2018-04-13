(function() {
    'use strict';

    const sectionLogin = document.getElementById('login');
    const sectionLoginError = document.getElementById('login-error');
    const sectionAccount = document.getElementById('account');

    const loginResult = window.location.hash;
    const params = new URLSearchParams(loginResult.substr(1));
    if (params.has('error')) {
        const error = params.get('error');
        const description = params.get('error_description');
        sectionLoginError.hidden = false;
        sectionLoginError.querySelector(
            'span'
        ).textContent = `${error}; ${description}`;
    } else if (params.has('access_token')) {
        const token = params.get('access_token');
        sectionLogin.hidden = true;
        sectionAccount.hidden = false;
        sectionAccount.textContent = token;
    }
})();
