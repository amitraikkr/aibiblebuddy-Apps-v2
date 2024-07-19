// AWS Cognito configuration
const poolData = {
    UserPoolId: 'us-east-2_gA0BLt06S', // Your user pool id here
    ClientId: '3uvepl4s80ulqn41v3e569rap3' // Your client id here
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Function to logout the user and redirect to sign-in page
function logout() {
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
        cognitoUser.signOut();
        console.log('User signed out successfully.');
    } else {
        console.log('No user is currently signed in.');
    }

    // Redirect to sign-in page
    window.location.href = 'signing.html';
}

// Add event listener to logout button
document.getElementById('logout-button').addEventListener('click', logout);