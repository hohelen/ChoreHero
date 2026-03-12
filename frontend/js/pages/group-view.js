requireLogin();

async function loadGroups() {
    const list = document.getElementById("group-list");
    if (!list) {
        console.error("group-list not found");
        return;
    }

    const plusButton = list.querySelector("li:last-child");
    const groups = await getMyGroups();

    if (!groups || groups.length === 0) {
        const empty = document.createElement("li");
        empty.innerHTML = `<p class="no-groups-msg">You're not in any groups yet.</p>`;
        list.insertBefore(empty, plusButton);
        return;
    }

    groups.forEach((group) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("button", "group-button");
        button.style.backgroundColor = group.color || "#cccccc";
        button.textContent = group.name;
        button.addEventListener("click", () => {
            window.location.href = `../pages/group/group-task.html?id=${group.id}&name=${encodeURIComponent(group.name)}`;
        });
        li.appendChild(button);
        list.insertBefore(li, plusButton);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadGroups();
});
