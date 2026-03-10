requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");
const userId = params.get("userId");
const memberName = params.get("member");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createTaskListItem(taskId, taskName) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = taskName;
    button.addEventListener("click", () => {
        window.location.href = `confirm-task.html?id=${groupId}&name=${encodeURIComponent(groupName)}&userId=${userId}&member=${encodeURIComponent(memberName)}&taskId=${taskId}&task=${encodeURIComponent(taskName)}`;
    });
    listItem.appendChild(button);
    return listItem;
}

function renderTasks(list, tasks) {
    list.innerHTML = "";
    if (tasks.length === 0) {
        list.innerHTML = `<p class="no-tasks-msg">No tasks found for this group.</p>`;
        return;
    }
    tasks.forEach((task) => {
        list.appendChild(createTaskListItem(task.id, task.title));
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const res = await authFetch(`/group/${groupId}/all-tasks`);
    if (!res) return;

    const data = await res.json();
    renderTasks(list, data.tasks);
});
