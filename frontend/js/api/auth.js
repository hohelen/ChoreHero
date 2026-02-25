const API = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// Call this at the top of any page that requires login.
// If the user is not logged in, they get redirected to login.html immediately.
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

async function authFetch(endpoint, options = {}) {
    const token = getToken();
    const res = await fetch(`${API}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    // If token is invalid or expired, log the user out
    if (res.status === 401) {
        logout();
        return;
    }

    return res;
}

async function getMyGroups() {
    const res = await authFetch("/my-groups");
    const data = await res.json();
    return data.groups;
}

async function getMyTasks() {
    const res = await authFetch("/my-tasks");
    const data = await res.json();
    return data.tasks;
}
