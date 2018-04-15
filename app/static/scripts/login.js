(function() {
    'use strict';

    const sectionLogin = document.getElementById('login');
    const sectionLoginError = document.getElementById('loginError');
    const sectionAccount = document.getElementById('account');
    const sectionAccountInfo = document.getElementById('accountInfo');
    const sectionAccountForm = document.getElementById('accountForm');
    const accountEdit = document.getElementById('accountEdit');
    const accountLogout = document.getElementById('accountLogout');

    const accountFormFields = {
        givenName: 'GivenName',
        familyName: 'FamilyName',
        displayName: 'DisplayName',
        street: 'Street',
        city: 'City',
        zip: 'Zip',
        state: 'State',
        country: 'Country'
    };

    handleLoginResult();
    accountEdit.addEventListener('click', editAccount);
    accountLogout.addEventListener('click', logout);
    sectionAccountForm.addEventListener('reset', cancelAccountForm);
    sectionAccountForm.addEventListener('submit', submitAccountForm);

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
            loadUserProfile();
            loadConnectedApplications();
        }
    }

    async function loadUserProfile() {
        const token = window.sessionStorage.getItem('token');
        const res = await fetch('/api/v1/userinfo', {
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

    async function loadConnectedApplications() {
        const token = window.sessionStorage.getItem('token');
        const res = await fetch('/api/v1/tokens', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const apps = await res.json();

        const list = document.getElementById('applications');
        for (const app of apps) {
            const item = document.createElement('li');
            item.textContent = app.application;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Revoke access';
            deleteButton.addEventListener('click', async () => {
                await fetch(`/api/v1/tokens/${app.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                item.remove();
            });
            item.appendChild(deleteButton);
            list.appendChild(item);
        }
    }

    function editAccount() {
        for (const field of Object.values(accountFormFields)) {
            const value = document.getElementById(`account${field}`)
                .textContent;
            document.getElementById(`accountForm${field}`).value = value;
        }

        sectionAccountInfo.hidden = true;
        sectionAccountForm.hidden = false;

        sectionAccountForm.querySelector('input').focus();
    }

    function cancelAccountForm(e) {
        e.preventDefault();
        sectionAccountInfo.hidden = false;
        sectionAccountForm.hidden = true;

        accountEdit.focus();
    }

    async function submitAccountForm(e) {
        e.preventDefault();

        const data = Object.keys(accountFormFields).reduce((data, key) => {
            const field = accountFormFields[key];
            data[key] = document.getElementById(`accountForm${field}`).value;
            return data;
        }, {});

        const token = window.sessionStorage.getItem('token');
        await fetch('/api/v1/userinfo', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        await loadUserProfile();

        sectionAccountInfo.hidden = false;
        sectionAccountForm.hidden = true;

        accountEdit.focus();
    }

    function logout() {
        window.sessionStorage.removeItem('token');
        sectionLogin.hidden = false;
        sectionAccount.hidden = true;

        sectionLogin.querySelector('a').focus();
    }
})();
