requireLogin();

async function loadGroups() {
    const groups = await getMyGroups();
    const list = document.getElementById("group-list");
    const plusButton = list.querySelector("li:last-child");

    if (!groups || groups.length === 0) {
        const empty = document.createElement("li");
        empty.innerHTML = `<p class="no-groups-msg">You're not in any groups yet.</p>`;
        list.insertBefore(empty, plusButton);
        return;
    }

    groups.forEach((group) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <button 
                class="button group-button" 
                style="background-color: ${group.color}"
                onclick="window.location.href = '../pages/group/group-task.html?id=${group.id}'"
            >
                ${group.name}
            </button>
        `;
        list.insertBefore(li, plusButton);
    });
}

loadGroups();
