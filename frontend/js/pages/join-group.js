requireLogin();

async function joinGroup() {
    const inviteCode = document.getElementById("group-invite-code").value.trim().toUpperCase();

    if (!inviteCode) {
        alert("Please enter an invite code.");
        return;
    }

    const res = await authFetch("/join-group", {
        method: "POST",
        body: JSON.stringify({ invite_code: inviteCode }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        window.location.href = "group-view.html";
    } else {
        alert(data.detail || "Failed to join group. Please try again.");
    }
}
