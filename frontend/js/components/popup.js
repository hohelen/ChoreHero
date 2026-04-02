// Creates the following UI popup element
// <div id="remove-member-popup" class="popup">
//    <div class="popup-content">
//        <img class="popup-remove-icon" src="../../assets/remove-icon.png"/>
//        <span class="popup-question">Are you sure you want <br> to remove this member?</span>
//        <span class="popup-label">Stephanie Nguyen</span>
//        <div class="popup-buttons">
//            <button class="popup-cancel-btn">Cancel</button>
//            <button class="popup-action-btn">Remove</button>
//        </div>
//     </div>
// </div>

function createPopUpContent(type, name) {
    const popupContent = document.createElement("div");
    popupContent.id = `${type}-popup`;
    popupContent.classList.add("popup-content");

    const removeIcon = document.createElement("img");
    removeIcon.classList.add("popup-remove-icon");
    const assetBase = window.location.pathname.includes("/pages/group/") ? "../../assets" : "../assets";
    removeIcon.src = `${assetBase}/remove-icon.png`;
    popupContent.appendChild(removeIcon);

    const popupQuestion = document.createElement("span");
    popupQuestion.classList.add("popup-question");
    if (type == "member") {
        popupQuestion.innerHTML = "Are you sure you want <br> to remove this member?";
    } else if (type == "admin") {
        popupQuestion.innerHTML = "Are you sure you want to <br> remove this admin's perms?";
    } else if (type == "leave") {
        popupQuestion.innerHTML = "Are you sure you want <br> to leave this group?";
    } else if (type == "task") {
        popupQuestion.innerHTML = "Are you sure you want <br> to delete this task?";
    } else {
        alert('Invalid type for popup. Please enter "member", "admin", "leave", or "task".');
    }

    popupContent.appendChild(popupQuestion);

    const popupName = document.createElement("span");
    popupName.classList.add("popup-name");
    popupName.innerHTML = name;
    popupContent.appendChild(popupName);

    const popupButtons = document.createElement("div");
    popupButtons.classList.add("popup-buttons");
    popupContent.appendChild(popupButtons);

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("popup-cancel-btn");
    cancelButton.textContent = "Cancel";
    popupButtons.appendChild(cancelButton);

    const actionButton = document.createElement("button");
    actionButton.classList.add("popup-action-btn");
    if (type == "leave") {
        actionButton.textContent = "Leave";
    } else if (type == "task") {
        actionButton.textContent = "Delete";
    } else {
        actionButton.textContent = "Remove";
    }
    popupButtons.appendChild(actionButton);

    return popupContent;
}

// Renders the popup
function renderPopup(popup, popupContent) {
    popup.innerHTML = "";
    popup.append(popupContent);
}

// Popup creation is triggered by page-specific scripts.
