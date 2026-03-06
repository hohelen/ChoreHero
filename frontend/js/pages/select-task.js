// Creates the following UI task element
// <li>
//    <button class="button" onclick="">Task Name</button>
// </li>

function createTaskListItem(taskName) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = taskName;
    // after selecting task, goes to select date page
    // should include name and task
    button.addEventListener("click", () => {
        window.location.href = `confirm-task.html?task=${encodeURIComponent(taskName)}`;
    });
    listItem.appendChild(button);
    return listItem;
}

// Renders the tasks
function renderTasks(list, tasks) {
    list.innerHTML = "";
    tasks.forEach((task) => {
        const listItem = createTaskListItem(task.taskName);
        list.appendChild(listItem);
    });
}

// Add the tasks
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    if (!list) {
        return;
    }

    // Replace this with a real API call to fetch tasks
    const tasks = [{ taskName: "Mop floor" }, { taskName: "Clean garage" }, { taskName: "Clean guest bathroom" }, { taskName: "Take out trash" }, { taskName: "Fix garage" }, { taskName: "Clean fridge" }, { taskName: "Change bulbs" }];
    renderTasks(list, tasks);
});
