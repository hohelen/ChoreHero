requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
if (body) {
    body.setAttribute("data-group-id", groupId);
    body.setAttribute("data-group-name", groupName);
}

async function createTask() {
    const title = document.getElementById("task-name").value.trim();
    const description = document.getElementById("task-description").value.trim();

    if (!title) {
        document.getElementById("error-msg").textContent = "Please enter a task name";
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
            description: description,
        }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        window.location.href = `group-task.html?id=${groupId}&name=${encodeURIComponent(groupName)}`;
    } else {
        alert(data.detail || "Failed to create task. Please try again.");
    }
}
