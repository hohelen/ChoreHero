// general top navbar (home button, group name, hub button, page title)
function loadNavbar({ groupId, pageTitle, groupName }) {
    var container = document.getElementById("top-navbar");
    if (!container) {
        console.error("Navbar container not found");
        return;
    }
    container.innerHTML = `
        <nav class="top-navbar">
            <div class="nav-row">
                <a href="../../pages/group-view.html?groupId=${groupId}" class="navbar-icon">
                    <img class="home-icon" src="../../assets/home-icon.png" alt="Home" />
                </a>
                <h1 id="group-name">${groupName}</h1>
                <a href="../../pages/hub.html" class="navbar-icon">
                    <img class="hub-icon" src="../../assets/hub-icon.png" alt="Hub" />
                </a>
            </div>
            <hr />
            <h2 id="page-title">${pageTitle}</h2>
        </nav>
    `;
}

// top navbar for group view (logout button, "My Groups", hub button)
function loadGroupViewNavbar({ pageTitle }) {
    var container = document.getElementById("top-navbar");
    if (!container) {
        console.error("Navbar container not found");
        return;
    }
    container.innerHTML = ` 
    <nav class="top-navbar">
            <div class="nav-row">
                <a href="../pages/landing.html" class="navbar-icon">
                    <img class="logout-icon" src="../assets/logout-icon.png" alt="Log Out" />
                </a>
                <h1>My Groups</h1>
                <a href="../pages/hub.html" class="navbar-icon">
                    <img class="hub-icon" src="../assets/hub-icon.png" alt="Hub" />
                </a>
            </div>
            <hr />
        </nav>
        `;
}

document.addEventListener("DOMContentLoaded", function () {
    const { navbarType, groupId, pageTitle, groupName } = document.body.dataset;
    if (navbarType === "group-specific") {
        loadNavbar({ groupId, pageTitle, groupName });
    } else if (navbarType === "group-view") {
        loadGroupViewNavbar({ pageTitle });
    }
});
