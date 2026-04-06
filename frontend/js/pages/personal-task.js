requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createTaskListItem(isComplete, day, date, task, taskId, dueDate, status, description) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.classList.add("task-comp");
    if (isComplete) {
        button.classList.add("task-complete");
        const strike = document.createElement("span");
        strike.classList.add("task-comp-strike");
        button.appendChild(strike);
    }

    button.addEventListener("click", () => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        window.location.href = `../../pages/task-view.html?id=${groupId}&name=${encodeURIComponent(groupName)}&taskId=${taskId}&task=${encodeURIComponent(task)}&description=${encodeURIComponent(description || "")}&assignee=${encodeURIComponent(currentUser.full_name)}&userId=${currentUser.id}&dueDate=${dueDate}&status=${status}`;
    });

    const dateWrap = document.createElement("span");
    dateWrap.classList.add("task-comp-date");

    const daySpan = document.createElement("span");
    daySpan.classList.add("task-comp-day-of-wk");
    daySpan.textContent = day;

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("task-comp-date-of-mo");
    dateSpan.textContent = date;

    dateWrap.appendChild(daySpan);
    dateWrap.appendChild(dateSpan);

    const detailWrap = document.createElement("span");
    detailWrap.classList.add("task-comp-detail");

    const taskSpan = document.createElement("span");
    taskSpan.classList.add("personal-task-comp-name");
    taskSpan.textContent = task;

    detailWrap.appendChild(taskSpan);

    button.appendChild(dateWrap);
    button.appendChild(detailWrap);
    listItem.appendChild(button);

    return listItem;
}

function renderTasks(list, tasks) {
    list.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        list.innerHTML = `<p class="no-tasks-msg">No tasks assigned to you in this group yet.</p>`;
        return;
    }

    const sorted = [...tasks].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
    });

    sorted.forEach((task) => {
        const isComplete = task.status === "completed";
        let day_of_week = "",
            date = "";
        if (task.due_date) {
            const [year, month, day] = task.due_date.split("-");
            const d = new Date(year, month - 1, day);
            day_of_week = d.toLocaleDateString("en-US", { weekday: "short" });
            date = d.getDate();
        }
        list.appendChild(createTaskListItem(isComplete, day_of_week, date, task.title, task.id, task.due_date, task.status, task.description));
    });
}

function setTaskCompColor(colorVar) {
    const rootStyles = getComputedStyle(document.documentElement);
    const resolvedColor = rootStyles.getPropertyValue(colorVar).trim();
    const color = resolvedColor || colorVar;

    document.querySelectorAll(".task-comp").forEach((taskComp) => {
        taskComp.style.backgroundColor = color;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const [tasksRes, groupsRes] = await Promise.all([authFetch(`/my-tasks/${groupId}`), authFetch("/my-groups")]);

    if (!tasksRes || !groupsRes) return;

    const [tasksData, groupsData] = await Promise.all([tasksRes.json(), groupsRes.json()]);

    const group = groupsData.groups.find((g) => g.id === parseInt(groupId));
    const color = group?.color || null;

    renderTasks(list, tasksData.tasks);

    if (color) {
        document.querySelectorAll(".task-comp").forEach((taskComp) => {
            taskComp.style.backgroundColor = color;
        });
    }
});
