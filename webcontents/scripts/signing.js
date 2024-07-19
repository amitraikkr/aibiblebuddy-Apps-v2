import config from './config.js';

function toggleForms(formToShow) {
    console.log(`Toggling to ${formToShow} form`);

    // Hide all forms
    document.getElementById('sign-in-form').style.display = 'none';
    document.getElementById('sign-up-form').style.display = 'none';
    document.getElementById('confirmation-form').style.display = 'none';

    // Clear all messages
    document.getElementById('sign-in-message').innerText = '';
    document.getElementById('sign-in-message').style.display = 'none';
    document.getElementById('sign-up-message').innerText = '';
    document.getElementById('sign-up-message').style.display = 'none';
    document.getElementById('confirmation-message').innerText = '';
    document.getElementById('confirmation-message').style.display = 'none';

    // Clear all text boxes
    document.getElementById('sign-in-username').value = '';
    document.getElementById('sign-in-password').value = '';

    document.getElementById('sign-up-password').value = '';
    //document.getElementById('sign-up-email').value = '';
    document.getElementById('confirmation-code').value = '';

    // Show the selected form
    if (formToShow === 'sign-in') {
        document.getElementById('sign-in-form').style.display = 'block';
    } else if (formToShow === 'sign-up') {
        document.getElementById('sign-up-form').style.display = 'block';
    } else if (formToShow === 'confirm-sign-up') {
        document.getElementById('confirmation-form').style.display = 'block';
    }
}

let poolData = {
    UserPoolId: config.UserPoolId, // Your user pool id here
    ClientId: config.ClientId // Your client id here
}


const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Helper function to display messages
function displayMessage(elementId, message, resetPasswordButton = false) {
    const messageElement = document.getElementById(elementId);
    messageElement.innerText = message;
    messageElement.style.display = 'block';
}

// Sign In function
document.getElementById('sign-in-button').addEventListener('click', () => {
    console.log('Sign In button clicked');

    const username = document.getElementById('sign-in-username').value;
    const password = document.getElementById('sign-in-password').value;

    console.log("Username:", username);
    console.log("Password:", password);

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
    });

    const userData = {
        Username: username,
        Pool: userPool,
    };


    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; secure; SameSite=Strict";
    }

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {

            const envType = config.envType;
            console.log('Environment Type:', envType);

            if(envType === 'dev'){
                localStorage.setItem('loggedInUser', username);
                localStorage.setItem('authToken',result.getAccessToken().getJwtToken());
            } else {
                setCookie('loggedInUser', username, 1);
                setCookie('authToken', result.getAccessToken().getJwtToken(), 1);
            }  
                // Fetch and store user email
            cognitoUser.getUserAttributes(function(err, attributes) {
                if (err) {
                    console.error(err);
                    return;
                }
                const email = attributes.find(attr => attr.Name === 'email').Value;
                if (envType === 'dev') {
                    localStorage.setItem('userEmail', email);
                } else {
                    setCookie('userEmail', email, 1);
                }
            });    

            // Send message to parent window and close the modal
            // Close the modal and refresh the parent window
            if (window.opener) {
                window.opener.postMessage({ type: 'login', username: username }, '*');
                window.close();
            } else {
                window.parent.postMessage({ type: 'login', username: username }, '*');
                window.close();
            }
        },
        onFailure: (err) => {
            console.error("Authentication failed:", err);
            displayMessage('sign-in-message', err.message || JSON.stringify(err), true);
        },
    });
});

// Sign Up function
document.getElementById('sign-up-button').addEventListener('click', () => {
    console.log('Sign Up button clicked');

    const username = document.getElementById('sign-up-username').value;
    const password = document.getElementById('sign-up-password').value;
    const email = document.getElementById('sign-up-email').value;

    const attributeList = [];

    const dataEmail = {
        Name: 'email',
        Value: email,
    };

    const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);

    userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
            console.error("Sign Up failed:", err);
            displayMessage('sign-up-message', err.message || JSON.stringify(err));
            return;
        }
        const cognitoUser = result.user;
        console.log('User name is ' + cognitoUser.getUsername());
        displayMessage('sign-up-message', 'Sign up successful! Please check your email for confirmation code.');
        toggleForms('confirm-sign-up');
    });
});

// Confirm Sign Up function
document.getElementById('confirm-sign-up-button').addEventListener('click', () => {
    console.log('Confirm Sign Up button clicked');

    const username = document.getElementById('sign-up-username').value;
    const email = document.getElementById('sign-up-email').value;
    const confirmationCode = document.getElementById('confirmation-code').value;

    console.log("Username:", username);
    console.log("Confirmation Code:", confirmationCode);

    const userData = {
        Username: username,
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
            console.error("Confirmation failed:", err);
            displayMessage('confirmation-message', err.message || JSON.stringify(err));
            return;
        }
        console.log('Call result:', result);
        displayMessage('confirmation-message', 'Confirmation successful! You can now sign in.');
      
        // Fetch the API key from Secrets Manager or cache
        const apiKey = globalConfig.apiKey;
        console.log('API key extracted from secret:', apiKey);
        //displayMessage('confirmation-message', apiKey);
        //displayMessage('confirmation-message', username);
        //displayMessage('confirmation-message', email);
    
            // Call the API to save the username and email to DynamoDB
        const apiEndpoint = 'https://err2fhihrb.execute-api.us-east-2.amazonaws.com/prod/user'; // Replace with your actual API endpoint
        const requestBody = {
            username: username,
            email: email
        };
    
        console.log('Sending API request to:', apiEndpoint);
        console.log('Request body:', requestBody);
    
        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                //displayMessage('confirmation-message', response);
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('User Data:', data);
            //displayMessage('confirmation-message', data);
            // Handle the API response if needed
        })
        .catch(error => {
            //displayMessage('confirmation-message', error);
            console.error('There was a problem with the fetch operation:', error);
        });
        toggleForms('sign-in');
    });
    
});

// Attach toggle function to toggle links
document.getElementById('toggle-sign-up').addEventListener('click', () => {
    toggleForms('sign-up');
});
document.getElementById('toggle-sign-in').addEventListener('click', () => {
    toggleForms('sign-in');
});

// Listen for messages from the popup
window.addEventListener('message', function(event) {
    if (event.data.type === 'login') {
        const username = event.data.username;
        localStorage.setItem('loggedInUser', username);
        window.location.reload();
    }
});