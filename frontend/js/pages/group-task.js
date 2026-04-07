// Creates the following UI task element
// <li>
//     <button class="task-comp" onclick="">
//         <span class="task-comp-date">
//             <span class="task-comp-day-of-wk">Mon</span>
//             <span class="task-comp-date-of-mo">20</span>
//         </span>
//         <span class="task-comp-detail">
//             <span class="task-comp-assignee">Stephanie Nguyen</span>
//             <span class="task-comp-name">Fix garage</span>
//         </span>
//     </button>
// </li>

requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

// Set immediately — safe because script is at bottom of body
const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createTaskListItem(isComplete, day, date, assignee, task, taskId, userId, dueDate, status, description) {
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
        window.location.href = `../../pages/task-view.html?id=${groupId}&name=${encodeURIComponent(groupName)}&taskId=${taskId}&task=${encodeURIComponent(task)}&description=${encodeURIComponent(description || "")}&assignee=${encodeURIComponent(assignee)}&userId=${userId}&dueDate=${dueDate}&status=${status}`;
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

    const assigneeSpan = document.createElement("span");
    assigneeSpan.classList.add("task-comp-assignee");
    assigneeSpan.textContent = assignee;

    const taskSpan = document.createElement("span");
    taskSpan.classList.add("task-comp-name");
    taskSpan.textContent = task;

    detailWrap.appendChild(assigneeSpan);
    detailWrap.appendChild(taskSpan);

    button.appendChild(dateWrap);
    button.appendChild(detailWrap);
    listItem.appendChild(button);

    return listItem;
}



// Renders the group tasks
function renderTasks(list, tasks) {
    list.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        list.innerHTML = `<p class="no-tasks-msg">No tasks assigned in this group yet.</p>`;
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
        list.appendChild(createTaskListItem(isComplete, dayOfWeek, dayOfMonth, task.assigned_to, task.title, task.id, task.user_id, task.due_date, task.status, task.description));
    });
}

// Sets the task component background color
function setTaskCompColor(colorVar) {
    const rootStyles = getComputedStyle(document.documentElement);
    const resolvedColor = rootStyles.getPropertyValue(colorVar).trim();
    const color = resolvedColor || colorVar;

    document.querySelectorAll(".task-comp").forEach((taskComp) => {
        taskComp.style.backgroundColor = color;
    });
}

// Adds the group tasks
document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const [tasksRes, groupsRes] = await Promise.all([authFetch(`/group/${groupId}/tasks`), authFetch("/my-groups")]);

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
