document.addEventListener("DOMContentLoaded", function () {
    loadInviteCode();
});

// TODO: Replace this with a real API call to fetch invite code
function loadInviteCode() {
    // sample invite code to test, replace with actual invite code
    code = "F4HX3L";
    document.getElementById("invite-code-text").textContent = code;
}

// TODO: add user to database
function addMember() {
    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();
    if (isValidEmail(email)) {
        // add user to database and display success message
        document.getElementById("confirmation-msg").textContent = "Invite sent to " + email;
    } else {
        document.getElementById("confirmation-msg").textContent = "Please enter a valid email address";
        return;
    }
}

function isValidEmail(email) {
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

function copyInviteCode() {
    var copyText = document.getElementById("invite-code-text").textContent;
    var confirmationCopy = document.getElementById("confirmation-copy");
    navigator.clipboard.writeText(copyText).then(() => {
        confirmationCopy.textContent = "Invite code copied";
        setTimeout(() => {
            confirmationCopy.textContent = "";
        }, 5000);
    });
}
