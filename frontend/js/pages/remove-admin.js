// Creates the following UI User element
// <li>
//    <button class="button" onclick="">Name<img class="remove-icon" src="../../assets/remove.png"/></button>
// </li>

function createUserListItem(name) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;
    button.dataset.adminName = name;

    const removeIcon = document.createElement("img");
    removeIcon.classList.add("remove-icon");
    removeIcon.src = "../../assets/remove-icon.png";
    button.appendChild(removeIcon);

    listItem.appendChild(button);
    return listItem;
}

// Renders the group admin
function renderUsers(list, users) {
    list.innerHTML = "";
    users.forEach((user) => {
        const listItem = createUserListItem(user.name);
        list.appendChild(listItem);
    });
}

// Add the group admins
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    if (!list) {
        return;
    }

    const popup = document.querySelector(".popup");

    // TODO: Replace this with a real API call to fetch group admins
    const users = [{ name: "Meiqi Li" }, { name: "Helen Ho" }];
    renderUsers(list, users);

    if (!popup) {
        return;
    }

    list.addEventListener("click", (event) => {
        const button = event.target.closest("button.button");
        if (!button) {
            return;
        }

        const adminName = button.dataset.adminName || button.textContent.trim();
        const content = createPopUpContent("admin", adminName);
        renderPopup(popup, content);
        popup.classList.add("is-visible");

        const cancelButton = popup.querySelector(".popup-cancel-btn");
        if (cancelButton) {
            cancelButton.addEventListener(
                "click",
                () => {
                    popup.classList.remove("is-visible");
                },
                { once: true }
            );
        }

        // TODO: Remove button should 1) downgrade admin to a regular member, 2) close the popup, 3) display the updated admins in the group in "Remove Admin"
    });
});
