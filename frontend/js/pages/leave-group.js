// Show the leave-group confirmation popup from the manage view
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    const popup = document.querySelector(".popup");
    if (!list || !popup) {
        return;
    }

    const leaveButton = Array.from(list.querySelectorAll("button.button")).find((button) => button.textContent.trim() === "Leave Group");
    if (!leaveButton) {
        return;
    }

    leaveButton.addEventListener("click", () => {
        const pageBody = document.querySelector("body");
        const groupName = pageBody?.dataset.groupName || "";
        const content = createPopUpContent("leave", groupName);
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

        // TODO: Leave button should 1) remove member from the group, 2) close the popup, 3) redirect user to groups view
    });
});
