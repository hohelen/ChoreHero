requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

document.addEventListener("DOMContentLoaded", () => {
    const body = document.getElementById("page-body");
    body.setAttribute("data-group-id", groupId);
    body.setAttribute("data-group-name", groupName);

    const encodedName = encodeURIComponent(groupName);
    document.querySelectorAll(".buttons-list button").forEach((button) => {
        const onclick = button.getAttribute("onclick");
        if (onclick) {
            const updated = onclick.replace(/\?groupId=\d+/, `?id=${groupId}&name=${encodedName}`);
            button.setAttribute("onclick", updated);
        }
    });
});
