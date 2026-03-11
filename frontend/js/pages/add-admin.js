// Creates the following UI User element
// <li>
//    <button class="button" onclick="AddAdmin()">Name<img class="add-icon" src="../../assets/add-icon.png" alt="Add Admin" /></button>
// </li>

function createUserListItem(name) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;

    // Add click event listener to the button to add the user as an admin when clicked
    button.addEventListener("click", () => addAdmin(name));

    const addIcon = document.createElement("img");
    addIcon.src = "../../assets/add-icon.png";
    addIcon.classList.add("add-icon");
    button.appendChild(addIcon);

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
    // TODO: replace this with real API call to fetch all group members who aren't admins
    const users = [{ name: "Stephanie Nguyen" }, { name: "Helen Ho" }, { name: "Rachel Pu" }];
    renderUsers(list, users);
});

// TODO: Adds the user as an admin when the button is clicked
function addAdmin() {}
