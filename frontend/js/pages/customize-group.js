requireLogin();

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const groupName = params.get("name");

const body = document.getElementById("page-body");
body.setAttribute("data-group-id", groupId);
body.setAttribute("data-group-name", groupName);

function createColorListItem(name, colorVar) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;

    const rootStyles = getComputedStyle(document.documentElement);
    const resolvedColor = rootStyles.getPropertyValue(colorVar).trim();
    button.style.backgroundColor = resolvedColor || colorVar;

    button.addEventListener("click", async () => {
        const res = await authFetch("/update-group-color", {
            method: "POST",
            body: JSON.stringify({
                group_id: parseInt(groupId),
                color: resolvedColor || colorVar,
            }),
        });

        if (!res) return;

        const data = await res.json();

        if (res.ok) {
            window.location.href = `group-task.html?id=${groupId}&name=${encodeURIComponent(groupName)}`;
        } else {
            alert(data.detail || "Failed to update color.");
        }
    });

    listItem.appendChild(button);
    return listItem;
}

function renderColors(list, colors, colorMap) {
    list.innerHTML = "";
    colors.forEach((color) => {
        list.appendChild(createColorListItem(color.name, colorMap[color.name]));
    });
}

function createColorMap() {
    return {
        Red: "--color-red",
        "Red-Orange": "--color-red-orange",
        Orange: "--color-orange",
        Yellow: "--color-yellow",
        Green: "--color-green",
        Blue: "--color-blue",
        "Blue-Purple": "--color-blue-purple",
        Purple: "--color-purple",
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    if (!list) return;

    const colorMap = createColorMap();
    const colors = Object.keys(colorMap).map((name) => ({ name }));
    renderColors(list, colors, colorMap);
});
