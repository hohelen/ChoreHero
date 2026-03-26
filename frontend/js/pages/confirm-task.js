requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");
const userId = params.get("userId");
const memberName = params.get("member");
const taskId = params.get("taskId");
const taskName = params.get("task");

// Set body attributes for navbar
const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

// Populate the display buttons
document.getElementById("member-display").textContent = memberName;
document.getElementById("task-display").textContent = taskName;

async function assignTask() {
    const rawDate = document.getElementById("task-date").value;

    if (!rawDate) {
        document.getElementById("error-msg").textContent = "Please enter a deadline";
        return;
    }

    const [month, day, year] = rawDate.split("/");
    const dueDate = `${year}-${month}-${day}`;

    const res = await authFetch("/assign-task", {
        method: "POST",
        body: JSON.stringify({
            task_id: parseInt(taskId),
            user_id: parseInt(userId),
            due_date: dueDate,
            group_id: parseInt(groupId),
        }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        window.location.href = `group-task.html?id=${groupId}&name=${encodeURIComponent(groupName)}`;
    } else {
        alert(data.detail || "Failed to confirm task. Please try again.");
    }
}
