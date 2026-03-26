// Creates the following UI User element
// <li>
//    <button class="button" onclick="">Name<img class="remove-icon" src="../../assets/remove.png"/></button>
// </li>

function createUserListItem(name) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;
    button.dataset.memberName = name;

    const removeIcon = document.createElement("img");
    removeIcon.classList.add("remove-icon");
    removeIcon.src = "../../assets/remove-icon.png";
    button.appendChild(removeIcon);

    listItem.appendChild(button);
    return listItem;
}

// Renders the group members
function renderUsers(list, users) {
    list.innerHTML = "";
    users.forEach((user) => {
        const listItem = createUserListItem(user.name);
        list.appendChild(listItem);
    });
}

// Add the group members
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    if (!list) {
        return;
    }

    const popup = document.querySelector(".popup");

    // TODO: Replace this with a real API call to fetch group members
    const users = [{ name: "Helen Ho" }, { name: "Stephanie Nguyen" }, { name: "Rachel Pu" }];
    renderUsers(list, users);

    if (!popup) {
        return;
    }

    list.addEventListener("click", (event) => {
        const button = event.target.closest("button.button");
        if (!button) {
            return;
        }

        const memberName = button.dataset.memberName || button.textContent.trim();
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
                () => {
                    popup.classList.remove("is-visible");
                    document.body.classList.remove("popup-open");
                    document.documentElement.classList.remove("popup-open");
                },
                { once: true },
            );
        }

        // TODO: Remove button should 1) remove member from the group, 2) close the popup, 3) display the updated members in the group in "Remove Member"
    });
});
