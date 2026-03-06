// Updates status 
function updateStatus(event) {
    if (event) {
        event.preventDefault();
    }

    const statusButton = document.getElementById("status-button");
    if (!statusButton) {
        return;
    }

    const current = statusButton.textContent.trim();
    statusButton.textContent = current === "Incomplete" ? "Complete" : "Incomplete";
}

function renderStatusControl(isAssignee) {
    const statusComp = document.getElementById("status")?.closest(".form-comp") || document.getElementById("status-button")?.closest(".form-comp");

    if (!statusComp) {
        return;
    }

    const existingInput = statusComp.querySelector("#status");
    const existingButton = statusComp.querySelector("#status-button");
    const existingBreak = statusComp.querySelector("br");

    if (existingInput) {
        existingInput.remove();
    }

    if (existingButton) {
        existingButton.remove();
    }

    if (existingBreak) {
        existingBreak.remove();
    }

    if (isAssignee) {
        const button = document.createElement("button");
        button.id = "status-button";
        button.type = "button";
        button.textContent = "Incomplete";
        button.addEventListener("click", updateStatus);
        statusComp.appendChild(button);
        return;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.id = "status";
    input.placeholder = "Incomplete";
    input.disabled = true;
    statusComp.appendChild(input);
    statusComp.appendChild(document.createElement("br"));
}

document.addEventListener("DOMContentLoaded", () => {
    const isAssignee = false;
    renderStatusControl(isAssignee);
});
