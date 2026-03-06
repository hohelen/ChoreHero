// general top navbar (home button, group name, hub button, page title)
function loadTopNavbar({ groupId, pageTitle, groupName, showBackButton }) {
    var container = document.getElementById("top-navbar");
    var titlerow;
    if (!container) {
        console.error("Top navbar container not found");
        return;
    }

    // for pages within the manage view, display the back arrow next to page title
    if (showBackButton) {
        titleRow = `<div class="title-row">
            <a onclick="window.history.back()" class="navbar-icon">
                <img class="back-icon" src="../../assets/back-arrow.png" alt="Back" />
            </a>
            <h2 id="page-title">${pageTitle}</h2>
        </div>`;
    } else {
        //titleRow = `<h2 id="page-title">${pageTitle}</h2>`;
        titleRow = `<div class="title-row">
            <div class="spacer"></div>
            <h2 id="page-title">${pageTitle}</h2>
            <div class="spacer"></div>
        </div>`;
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
            ${titleRow}
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

function loadHubNavbar({ pageTitle }) {
    var container = document.getElementById("top-navbar");
    if (!container) {
        console.error("Navbar container not found");
        return;
    }
    container.innerHTML = `
        <nav class="top-navbar">
            <div class="nav-row">
                <a href="group-view.html" class="navbar-icon">
                    <img class="home-icon" src="../assets/home-icon.png" alt="Home" />
                </a>
                <h1>Hub</h1>
                <a onclick="window.history.back()">
                    <img class="hub-icon" src="../assets/hub-icon.png" alt="Hub" />
                </a>
            </div>
            <hr />
            <h2 id="page-title">All Tasks</h2>
        </nav>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    const { navbarType, groupId, pageTitle, groupName } = document.body.dataset;
    if (navbarType === "group-specific") {
        loadTopNavbar({ groupId, pageTitle, groupName, showBackButton: false });
    } else if (navbarType === "manage-view-pages") {
        loadTopNavbar({ groupId, pageTitle, groupName, showBackButton: true });
    } else if (navbarType === "group-view") {
        loadGroupViewNavbar({ pageTitle });
    } else if (navbarType === "hub") {
        loadHubNavbar({ pageTitle });
    }
});
