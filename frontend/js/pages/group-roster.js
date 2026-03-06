// Creates the following UI Task element
// <li>
//    <button class="button" onclick="">Name</button>
// </li>

function createUserListItem(name) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;
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

    // Replace this with a real API call to fetch group members
    const users = [{ name: "Meiqi Li" }, { name: "Stephanie Nguyen" }, { name: "Helen Ho" }, { name: "Rachel Pu" }];
    renderUsers(list, users);
});
