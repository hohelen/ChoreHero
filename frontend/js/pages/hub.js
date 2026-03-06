// Creates the following UI task element
// <li>
//     <button class="task-comp" onclick="">
//         <span class="task-comp-date">
//             <span class="task-comp-day-of-wk">Mon</span>
//             <span class="task-comp-date-of-mo">2</span>
//         </span>
//         <span class="task-comp-detail">
//             <span class="task-comp-group">Li Residence</span>
//             <span class="task-comp-name">Take out trash</span>
//         </span>
//     </button>
// </li>

function createTaskListItem(isComplete, day, date, group, task) {
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

// Renders the group tasks
function renderTasks(list, tasks) {
    list.innerHTML = "";
    tasks.forEach((task) => {
        list.appendChild(createTaskListItem(task.isComplete, task.day, task.date, task.group, task.name));
    });
}

// Creates a group to color map - used for setSpecificTaskCompColor
function createGroupColorMap() {
    return {
        "Li Residence": "--color-red-orange",
        "Nguyen House": "--color-green",
        "Reitz Union Hotel": "--color-blue",
        "Gainesville Apt": "--color-yellow",
        "Ho Residence": "--color-purple",
    };
}

// Sets the task component background color
function setSpecificTaskCompColor(groupColorMap) {
    const rootStyles = getComputedStyle(document.documentElement);

    document.querySelectorAll(".task-comp").forEach((taskComp) => {
        const groupName = taskComp.querySelector(".task-comp-group")?.textContent?.trim();
        const colorVar = groupName ? groupColorMap[groupName] : null;

        if (!colorVar) {
            return;
        }

        const resolvedColor = rootStyles.getPropertyValue(colorVar).trim();
        const color = resolvedColor || colorVar;
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
        { isComplete: true, day: "Mon", date: "2", group: "Li Residence", name: "Take out trash" },
        { isComplete: false, day: "Thu", date: "5", group: "Li Residence", name: "Clean garage" },
        { isComplete: true, day: "Sun", date: "15", group: "Nguyen House", name: "Take out trash" },
        { isComplete: true, day: "Tue", date: "17", group: "Reitz Union Hotel", name: "Clean fridge" },
        { isComplete: false, day: "Thu", date: "19", group: "Gainesville Apt", name: "Clean guest bathroom" },
        { isComplete: true, day: "Fri", date: "20", group: "Ho Residence", name: "Fix garage" },
        { isComplete: false, day: "Mon", date: "23", group: "Reitz Union Hotel", name: "Clean fridge" },
        { isComplete: false, day: "Wed", date: "25", group: "Li Residence", name: "Take out trash" },
        { isComplete: false, day: "Sat", date: "28", group: "Nguyen House", name: "Change bulbs" },
        { isComplete: true, day: "Mon", date: "2", group: "Li Residence", name: "Take out trash" },
        { isComplete: false, day: "Thu", date: "5", group: "Li Residence", name: "Clean garage" },
        { isComplete: true, day: "Sun", date: "15", group: "Nguyen House", name: "Take out trash" },
        { isComplete: true, day: "Tue", date: "17", group: "Reitz Union Hotel", name: "Clean fridge" },
        { isComplete: false, day: "Thu", date: "19", group: "Gainesville Apt", name: "Clean guest bathroom" },
        { isComplete: true, day: "Fri", date: "20", group: "Ho Residence", name: "Fix garage" },
        { isComplete: false, day: "Mon", date: "23", group: "Reitz Union Hotel", name: "Clean fridge" },
        { isComplete: false, day: "Wed", date: "25", group: "Li Residence", name: "Take out trash" },
        { isComplete: false, day: "Sat", date: "28", group: "Nguyen House", name: "Change bulbs" },
    ];

    renderTasks(list, tasks);
    setSpecificTaskCompColor(createGroupColorMap());
});
