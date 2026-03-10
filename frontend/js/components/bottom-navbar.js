function loadBottomNavbar({ groupId, groupName, currentView }) {
    var container = document.getElementById("bottom-navbar");
    if (!container) {
        console.error("Bottom navbar container not found");
        return;
    }
    const encodedName = encodeURIComponent(groupName);
    container.innerHTML = `<nav class="bottom-navbar">
            <a class="${currentView === "personal-task" ? "active" : ""}" href="personal-task.html?id=${groupId}&name=${encodedName}" class="navbar-icon">
                <img class="personal-task-icon" src="../../assets/personal-task.png" alt="Personal Task View" />
            </a>
            <a class="${currentView === "group-task" ? "active" : ""}" href="group-task.html?id=${groupId}&name=${encodedName}" class="navbar-icon">
                <img class="group-task-icon" src="../../assets/group-task.png" alt="Group Task View" />
            </a>
            <a class="${currentView === "manage-view" ? "active" : ""}" href="manage-view.html?id=${groupId}&name=${encodedName}" class="navbar-icon">
                <img class="manage-view-icon" src="../../assets/manage-view.png" alt="Admin View" />
            </a>
        </nav>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
<<<<<<< HEAD
    const { navbarType, groupId, groupName, currentView } = document.body.dataset;
    if (navbarType === "group-specific") {
        loadBottomNavbar({ groupId, groupName, currentView });
=======
    const { navbarType, groupId, currentView } = document.body.dataset;
    if (navbarType === "group-specific" || navbarType === "manage-view-pages") {
        loadBottomNavbar({ groupId, currentView });
>>>>>>> 4ab23deb853c6f413bd4d2167639bc607ebaf887
    }
});
