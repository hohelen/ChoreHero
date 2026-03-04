// bottom navbar (personal tasks view, group tasks view, manage view)
function loadBottomNavbar({ groupId, currentView }) {
    var container = document.getElementById("bottom-navbar");
    if (!container) {
        console.error("Bottom navbar container not found");
        return;
    }
    container.innerHTML = `<nav class="bottom-navbar">
            <a class="${currentView === "personal-task" ? "active" : ""}" href="personal-task.html?groupId=${groupId}" class="navbar-icon">
                <img class="personal-task-icon" src="../../assets/personal-task.png" alt="Personal Task View" />
            </a>
            <a class="${currentView === "group-task" ? "active" : ""}" href="group-task.html?groupId=${groupId}" class="navbar-icon">
                <img class="group-task-icon" src="../../assets/group-task.png" alt="Group Task View" />
            </a>
            <a class="${currentView === "manage-view" ? "active" : ""}" href="manage-view.html?groupId=${groupId}" class="navbar-icon">
                <img class="manage-view-icon" src="../../assets/manage-view.png" alt="Admin View" />
            </a>
        </nav>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    const { navbarType, groupId, currentView } = document.body.dataset;
    if (navbarType === "group-specific") {
        loadBottomNavbar({ groupId, currentView });
    }
});
