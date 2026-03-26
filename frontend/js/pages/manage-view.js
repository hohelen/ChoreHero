requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

document.addEventListener("DOMContentLoaded", async () => {
    const encodedName = encodeURIComponent(groupName);

    // Update all button hrefs
    document.querySelectorAll(".buttons-list button").forEach((button) => {
        const onclick = button.getAttribute("onclick");
        if (onclick) {
            button.setAttribute("onclick", onclick.replace(/\?groupId=\d+/, `?id=${groupId}&name=${encodedName}`));
        }
    });

    // Fetch user's role in this group
    const res = await authFetch("/my-groups");
    if (!res) return;

    const data = await res.json();
    const group = data.groups.find((g) => g.id === parseInt(groupId));
    if (!group) return;

    if (group.role !== "admin") {
        // Member — hide admin buttons
        document.querySelectorAll(".admin-only").forEach((el) => {
            el.style.display = "none";
        });
    } else {
        // Admin — hide leave group button
        document.querySelectorAll(".member-only").forEach((el) => {
            el.style.display = "none";
        });
    }
});
