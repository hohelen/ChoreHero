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
    button.dataset.memberName = name;
    button.dataset.userId = userId;

    const removeIcon = document.createElement("img");
    removeIcon.classList.add("remove-icon");
    removeIcon.src = "../../assets/remove-icon.png";
    button.appendChild(removeIcon);

    listItem.appendChild(button);
    return listItem;
}

function renderUsers(list, members) {
    list.innerHTML = "";

    if (!members || members.length === 0) {
        list.innerHTML = `<p class="no-members-msg">No members to remove.</p>`;
        return;
    }

    members.forEach((member) => {
        list.appendChild(createUserListItem(member.id, member.full_name));
    });
}

async function removeMember(userId, listItem) {
    const res = await authFetch("/remove-member", {
        method: "POST",
        body: JSON.stringify({
            group_id: parseInt(groupId),
            user_id: userId,
        }),
    });

    if (!res) return;

    const data = await res.json();

    if (res.ok) {
        listItem.remove();
    } else {
        alert(data.detail || "Failed to remove member.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const popup = document.querySelector(".popup");

    const res = await authFetch(`/group/${groupId}/members`);
    if (!res) return;

    const data = await res.json();

    // Only show members, not admins
    const members = data.members.filter((m) => m.role === "member");
    renderUsers(list, members);

    if (!popup) return;

    list.addEventListener("click", (event) => {
        const button = event.target.closest("button.button");
        if (!button) return;

        const memberName = button.dataset.memberName || button.textContent.trim();
        const userId = parseInt(button.dataset.userId);
        const listItem = button.closest("li");

        const content = createPopUpContent("member", memberName);
        renderPopup(popup, content);
        popup.classList.add("is-visible");
        document.body.classList.add("popup-open");
        document.documentElement.classList.add("popup-open");

        const cancelButton = popup.querySelector(".popup-cancel-btn");
        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                () => {
                    popup.classList.remove("is-visible");
                    document.body.classList.remove("popup-open");
                    document.documentElement.classList.remove("popup-open");
                },
                { once: true },
            );
        }

        const actionButton = popup.querySelector(".popup-action-btn");
        if (actionButton) {
            actionButton.addEventListener(
                "click",
                async () => {
                    popup.classList.remove("is-visible");
                    document.body.classList.remove("popup-open");
                    document.documentElement.classList.remove("popup-open");
                    await removeMember(userId, listItem);
                },
                { once: true },
            );
        }
    });
});
