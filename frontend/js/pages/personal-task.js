// Creates the following UI task element
// <li>
//     <button class="task-comp" onclick="">
//         <span class="task-comp-date">
//             <span class="task-comp-day-of-wk">Mon</span>
//             <span class="task-comp-date-of-mo">20</span>
//         </span>
//         <span class="task-comp-detail">
//             <span class="personal-task-comp-name">Fix garage</span>
//         </span>
//     </button>
// </li>

function createTaskListItem(isComplete, day, date, task) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.classList.add("task-comp");
    if (isComplete) {
        button.classList.add("task-complete");

        const strike = document.createElement("span");
        strike.classList.add("task-comp-strike");
        button.appendChild(strike);
    }

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

// Renders the group tasks
function renderTasks(list, tasks) {
    list.innerHTML = "";
    tasks.forEach((task) => {
        list.appendChild(createTaskListItem(task.isComplete, task.day, task.date, task.name));
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
    if (!list) {
        return;
    }

    // Later: replace this with a real API call
    // const res = await fetch("/api/tasks");
    // const tasks = await res.json();

    const tasks = [
        { isComplete: true, day: "Mon", date: "2", name: "Take out trash" },
        { isComplete: false, day: "Thu", date: "5", name: "Clean garage" },
        { isComplete: false, day: "Fri", date: "13", name: "Wash linens" },
        { isComplete: false, day: "Sat", date: "14", name: "Mop floors" },
        { isComplete: false, day: "Tue", date: "17", name: "Fix garage" },
        { isComplete: false, day: "Thu", date: "19", name: "Clean guest bathroom" },
        { isComplete: false, day: "Sat", date: "28", name: "Mop floors" },
        { isComplete: false, day: "Sun", date: "1", name: "Wash bedsheets" },


    ];

    renderTasks(list, tasks);
    setTaskCompColor("--color-red-orange");
});
