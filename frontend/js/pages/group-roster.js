// Creates the following UI User element
// <li>
//    <button class="button" onclick="">Name</button>
// </li>

function createUserListItem(name, isAdmin) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;
    if (isAdmin) {
        const starIcon = document.createElement("img");
        starIcon.src = "../../assets/manage-view.png";
        starIcon.classList.add("admin-icon");
        button.appendChild(starIcon);
    }
    listItem.appendChild(button);
    return listItem;
}

// Renders the group members
function renderUsers(list, users) {
    list.innerHTML = "";
    users.forEach((user) => {
        const listItem = createUserListItem(user.name, user.isAdmin);
        list.appendChild(listItem);
    });
}

// Add the group members
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    if (!list) {
        return;
    }

    // Replace this with a real API call to fetch group members
    // get name and whether they are admins
    const users = [
        { name: "Meiqi Li", isAdmin: true },
        { name: "Stephanie Nguyen", isAdmin: true },
        { name: "Helen Ho", isAdmin: false },
        { name: "Rachel Pu", isAdmin: false },
    ];
    renderUsers(list, users);
});
