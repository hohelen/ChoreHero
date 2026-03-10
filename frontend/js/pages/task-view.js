// Updates status
async function updateStatus(event) {
    if (event) event.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const taskId = params.get("taskId");
    const statusButton = document.getElementById("status-button");
    if (!statusButton) return;

    const current = statusButton.textContent.trim();
    const newStatus = current === "Incomplete" ? "completed" : "incomplete";

    const res = await authFetch(`/update-task-status`, {
        method: "POST",
        body: JSON.stringify({ task_id: parseInt(taskId), status: newStatus }),
    });

    if (res && res.ok) {
        statusButton.textContent = newStatus === "completed" ? "Complete" : "Incomplete";
    } else {
        alert("Failed to update status.");
    }
}

function renderStatusControl(isAssignee, currentStatus) {
    const statusComp = document.getElementById("status")?.closest(".form-comp") || document.getElementById("status-button")?.closest(".form-comp");
    if (!statusComp) return;

    statusComp.querySelector("#status")?.remove();
    statusComp.querySelector("#status-button")?.remove();
    statusComp.querySelector("br")?.remove();

    if (isAssignee) {
        const button = document.createElement("button");
        button.id = "status-button";
        button.type = "button";
        button.textContent = currentStatus === "completed" ? "Complete" : "Incomplete";
        button.addEventListener("click", updateStatus);
        statusComp.appendChild(button);
        return;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.id = "status";
    input.value = currentStatus === "completed" ? "Complete" : "Incomplete";
    input.disabled = true;
    statusComp.appendChild(input);
    statusComp.appendChild(document.createElement("br"));
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const groupName = params.get("name");
    const taskName = params.get("task");
    const assignee = params.get("assignee");
    const dueDate = params.get("dueDate");
    const status = params.get("status");
    const assigneeUserId = parseInt(params.get("userId"));

    // Populate fields
    document.getElementById("group").value = groupName;
    document.getElementById("assignee").value = assignee;
    document.getElementById("task").value = taskName;
    document.getElementById("due-date").value = dueDate ? new Date(dueDate).toLocaleDateString("en-US") : "";

    // Check if current user is the assignee
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isAssignee = currentUser && currentUser.id === assigneeUserId;

    renderStatusControl(isAssignee, status);
});
