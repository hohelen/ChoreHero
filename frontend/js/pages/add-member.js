requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

document.addEventListener("DOMContentLoaded", async () => {
    await loadInviteCode();
});

async function loadInviteCode() {
    const res = await authFetch(`/group/${groupId}/invite-code`);
    if (!res) return;

    const data = await res.json();
    document.getElementById("invite-code-text").textContent = data.invite_code;
}

async function addMember() {
    const email = document.getElementById("email").value.trim();

    if (!isValidEmail(email)) {
        document.getElementById("confirmation-msg").textContent = "Please enter a valid email address.";
        return;
    }

    const res = await authFetch("/send-invite", {
        method: "POST",
        body: JSON.stringify({
            group_id: parseInt(groupId),
            email: email,
        }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        document.getElementById("confirmation-msg").textContent = `Successfully sent invite to ${email}.`;
    } else {
        document.getElementById("confirmation-msg").textContent = data.detail || "Failed to send invite.";
    }
}

function isValidEmail(email) {
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

function copyInviteCode() {
    const copyText = document.getElementById("invite-code-text").textContent;
    const confirmationCopy = document.getElementById("confirmation-copy");
    navigator.clipboard.writeText(copyText).then(() => {
        confirmationCopy.textContent = "Invite code copied";
        setTimeout(() => {
            confirmationCopy.textContent = "";
        }, 5000);
    });
}
