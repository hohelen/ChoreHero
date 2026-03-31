document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    const popup = document.querySelector(".popup");
    if (!list || !popup) return;

    const leaveButton = Array.from(list.querySelectorAll("button.button")).find((button) => button.textContent.trim() === "Leave Group");
    if (!leaveButton) return;

    leaveButton.addEventListener("click", () => {
        const pageBody = document.querySelector("body");
        const params = new URLSearchParams(window.location.search);
        const groupName = params.get("name") || "";
        const groupId = params.get("id") || "";

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
                async () => {
                    popup.classList.remove("is-visible");
                    document.body.classList.remove("popup-open");
                    document.documentElement.classList.remove("popup-open");

                    const res = await authFetch("/leave-group", {
                        method: "POST",
                        body: JSON.stringify({ group_id: parseInt(groupId) }),
                    });

                    if (!res) return;

                    const data = await res.json();

                    if (res.ok) {
                        window.location.href = "../../pages/group-view.html";
                    } else {
                        alert(data.detail || "Failed to leave group.");
                    }
                },
                { once: true },
            );
        }
    });
});
