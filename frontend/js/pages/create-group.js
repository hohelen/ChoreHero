requireLogin();

async function createGroup() {
    const name = document.getElementById("group-name").value.trim();

    if (!name) {
        document.getElementById("error-msg").textContent = "Please enter a group name";
        return;
    }

    const res = await authFetch("/create-group", {
        method: "POST",
        body: JSON.stringify({ name }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        window.location.href = "group-view.html";
    } else {
        alert(data.detail || "Failed to create group. Please try again.");
    }
}
