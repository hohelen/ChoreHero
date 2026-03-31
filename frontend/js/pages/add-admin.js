requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createUserListItem(userId, name) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;
    button.dataset.userId = userId;

    button.addEventListener("click", () => addAdmin(userId, name, button, listItem));

    const addIcon = document.createElement("img");
    addIcon.src = "../../assets/add-icon.png";
    addIcon.classList.add("add-icon");
    button.appendChild(addIcon);

    listItem.appendChild(button);
    return listItem;
}

function renderUsers(list, members) {
    list.innerHTML = "";

    if (!members || members.length === 0) {
        list.innerHTML = `<p class="no-members-msg">No members to promote.</p>`;
        return;
    }

    members.forEach((member) => {
        list.appendChild(createUserListItem(member.id, member.full_name));
    });
}

async function addAdmin(userId, name, button, listItem) {
    const res = await authFetch("/update-member-role", {
        method: "POST",
        body: JSON.stringify({
            group_id: parseInt(groupId),
            user_id: userId,
            role: "admin",
        }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        listItem.remove();
    } else {
        alert(data.detail || "Failed to add admin.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const res = await authFetch(`/group/${groupId}/members`);
    if (!res) return;

    const data = await res.json();

    // Only show members, not admins
    const members = data.members.filter((m) => m.role === "member");
    renderUsers(list, members);
});
