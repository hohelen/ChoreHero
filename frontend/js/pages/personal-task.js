requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createTaskListItem(isComplete, day, date, task, taskId, dueDate, status) {
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
        window.location.href = `../../pages/task-view.html?id=${groupId}&name=${encodeURIComponent(groupName)}&taskId=${taskId}&task=${encodeURIComponent(task)}&assignee=${encodeURIComponent(currentUser.full_name)}&userId=${currentUser.id}&dueDate=${dueDate}&status=${status}`;
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

    tasks.forEach((task) => {
        const isComplete = task.status === "completed";
        let day = "",
            date = "";
        if (task.due_date) {
            const d = new Date(task.due_date);
            day = d.toLocaleDateString("en-US", { weekday: "short" });
            date = d.getDate();
        }
        list.appendChild(createTaskListItem(isComplete, day, date, task.title, task.id, task.due_date, task.status));
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

    const res = await authFetch(`/my-tasks/${groupId}`);
    if (!res) return;

    const data = await res.json();
    renderTasks(list, data.tasks);
    setTaskCompColor("--color-red-orange");
});
