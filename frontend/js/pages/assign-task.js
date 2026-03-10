requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createUserListItem(userId, userName) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = userName;
    button.addEventListener("click", () => {
        window.location.href = `select-task.html?id=${groupId}&name=${encodeURIComponent(groupName)}&userId=${userId}&member=${encodeURIComponent(userName)}`;
    });
    listItem.appendChild(button);
    return listItem;
}

function renderUsers(list, members) {
    list.innerHTML = "";
    if (members.length === 0) {
        list.innerHTML = `<p class="no-members-msg">No members found in this group.</p>`;
        return;
    }
    members.forEach((member) => {
        list.appendChild(createUserListItem(member.id, member.full_name));
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const res = await authFetch(`/group/${groupId}/members`);
    if (!res) return;

    const data = await res.json();
    renderUsers(list, data.members);
});
