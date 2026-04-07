requireLogin();

function createTaskListItem(isComplete, day, date, group, task, taskId, userId, dueDate, status, groupId, groupName, groupColor, description) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.classList.add("task-comp");
    if (isComplete) {
        button.classList.add("task-complete");
        const strike = document.createElement("span");
        strike.classList.add("task-comp-strike");
        button.appendChild(strike);
    }

    if (groupColor) {
        button.style.backgroundColor = groupColor;
    }

    button.addEventListener("click", () => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        window.location.href = `task-view.html?id=${groupId}&name=${encodeURIComponent(groupName)}&taskId=${taskId}&task=${encodeURIComponent(task)}&description=${encodeURIComponent(description || "")}&assignee=${encodeURIComponent(currentUser.full_name)}&userId=${currentUser.id}&dueDate=${dueDate}&status=${status}`;
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

    const groupSpan = document.createElement("span");
    groupSpan.classList.add("task-comp-group");
    groupSpan.textContent = group;

    const taskSpan = document.createElement("span");
    taskSpan.classList.add("task-comp-name");
    taskSpan.textContent = task;

    detailWrap.appendChild(groupSpan);
    detailWrap.appendChild(taskSpan);

    button.appendChild(dateWrap);
    button.appendChild(detailWrap);
    listItem.appendChild(button);

    return listItem;
}

function renderTasks(list, tasks) {
    list.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        list.innerHTML = `<p class="no-tasks-msg">No tasks assigned to you yet.</p>`;
        return;
    }

    const sorted = [...tasks].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
    });

    let currentDividerKey = null;
    let noDueDateDividerAdded = false;

    sorted.forEach((task) => {
        const isComplete = task.status === "completed";
        let dayOfWeek = "",
            dayOfMonth = "";
        if (task.due_date) {
            const [year, month, day] = task.due_date.split("-");
            const d = new Date(year, month - 1, day);
            const dividerKey = `${year}-${month}`;

            if (dividerKey !== currentDividerKey) {
                const divider = document.createElement("li");
                divider.classList.add("task-date-divider");

                const leftLine = document.createElement("span");
                leftLine.classList.add("task-date-divider-line");

                const label = document.createElement("span");
                label.textContent = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

                const rightLine = document.createElement("span");
                rightLine.classList.add("task-date-divider-line");

                divider.appendChild(leftLine);
                divider.appendChild(label);
                divider.appendChild(rightLine);
                list.appendChild(divider);

                currentDividerKey = dividerKey;
            }
            dayOfWeek = d.toLocaleDateString("en-US", { weekday: "short" });
            dayOfMonth = d.getDate();
        } else if (!noDueDateDividerAdded) {
            const divider = document.createElement("li");
            divider.classList.add("task-date-divider");

            const leftLine = document.createElement("span");
            leftLine.classList.add("task-date-divider-line");

            const label = document.createElement("span");
            label.textContent = "No due date";

            const rightLine = document.createElement("span");
            rightLine.classList.add("task-date-divider-line");

            divider.appendChild(leftLine);
            divider.appendChild(label);
            divider.appendChild(rightLine);
            list.appendChild(divider);

            noDueDateDividerAdded = true;
        }
        list.appendChild(createTaskListItem(isComplete, dayOfWeek, dayOfMonth, task.group_name, task.title, task.id, task.user_id, task.due_date, task.status, task.group_id, task.group_name, task.color, task.description));
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const res = await authFetch("/my-tasks/all");
    if (!res) return;

    const data = await res.json();
    renderTasks(list, data.tasks);
});
