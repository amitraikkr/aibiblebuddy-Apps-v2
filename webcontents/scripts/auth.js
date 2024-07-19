
import config from './config.js';

let loggedUser;

function openSignInModal() {
    // Apply blur to the parent window
    document.body.classList.add('blur');

    // Calculate the position for centering the popup
    const width = 300;
    const height = 500;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);

    // Open the popup
    window.signInWindow = window.open('signing.html', 'SignIn', `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no,status=no,toolbar=no,menubar=no,location=no,directories=no`);

    // Listen for popup close event
    const checkPopup = setInterval(() => {
        if (window.signInWindow.closed) {
            clearInterval(checkPopup);
            document.body.classList.remove('blur');
        }
    }, 100);
}

function closeSignInModal() {
    document.getElementById('signInModal').classList.add('hidden');
    document.body.classList.remove('blur');
}

function checkLoggedIn() {
    console.log('Environment Type:', config.envType);
    let loggedInUser;
    if (config.envType === 'dev') {
        loggedInUser = localStorage.getItem('loggedInUser');
    } else {
        loggedInUser = getCookie('loggedInUser');
    }
    if (loggedInUser) {
        document.getElementById('signInLink').classList.add('hidden');
        const signInMessage = document.getElementById('signInMessage');
        if (signInMessage) {
            signInMessage.classList.add('hidden');
        }
        document.getElementById('loggedInUser').classList.remove('hidden');
        document.getElementById('logoutLink').classList.remove('hidden');
        const buddyMessage = document.getElementById('buddyMessage');
        if (buddyMessage) {
            buddyMessage.classList.remove('hidden');
        }
        document.getElementById('username').innerText = loggedInUser;
    }
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

export function logout() {
    if (config.envType === 'dev') {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('authToken');
    } else {
        deleteCookie('loggedInUser');
        deleteCookie('authToken');
    }
    window.location.href = 'index.html'; // Redirect to index.html
}

// Attach the event listeners to the Sign-In link and close button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signInLink').addEventListener('click', openSignInModal);
    const signInLinkText = document.getElementById('signInLinkText');
    if (signInLinkText) {
        signInLinkText.addEventListener('click', openSignInModal);
    }
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeSignInModal);
    }
    document.getElementById('logoutLink').addEventListener('click', logout);

    checkLoggedIn();
});

// Listen for messages from the popup
window.addEventListener('message', function (event) {
    if (event.data.type === 'login') {
        const username = event.data.username;
        if (config.envType === 'dev') {
            localStorage.setItem('loggedInUser', username);
        } else {
            document.cookie = `loggedInUser=${username}; path=/; secure; SameSite=Strict`;
        }
        window.location.reload();
    }
});