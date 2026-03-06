requireLogin();

// Pull group info from URL
const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

// Set body attributes dynamically
const body = document.getElementById("page-body");
if (body) {
    body.setAttribute("data-group-id", groupId);
    body.setAttribute("data-group-name", groupName);
}

async function createTask() {
    const title = document.getElementById("task-name").value.trim();

    if (!title) {
        alert("Please enter a task name.");
        return;
    }

    if (!groupId) {
        alert("No group selected.");
        return;
    }

    const res = await authFetch("/create-task", {
        method: "POST",
        body: JSON.stringify({
            group_id: parseInt(groupId),
            title: title,
        }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        window.location.href = `group-task.html?id=${groupId}&name=${encodeURIComponent(groupName)}`;
    } else {
        alert(data.detail || "Failed to create task. Please try again.");
    }

    // make sure it moves to select-member
}
