// Creates the following UI Button element
// <li>
//    <button class="button" onclick="">Red</button>
// </li>

function createColorListItem(name) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = name;
    listItem.appendChild(button);
    return listItem;
}

// Renders the colors
function renderColors(list, colors) {
    list.innerHTML = "";
    colors.forEach((color) => {
        const listItem = createColorListItem(color.name);
        list.appendChild(listItem);
    });
}

// Creates a group to color map - used for setSpecificButtonColor
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

// Sets the button background color
function setSpecificButtonColor(groupColorMap) {
    const rootStyles = getComputedStyle(document.documentElement);

    document.querySelectorAll(".button").forEach((button) => {
        const colorName = button.textContent?.trim();
        const colorVar = colorName ? groupColorMap[colorName] : null;

        if (!colorVar) {
            return;
        }

        const resolvedColor = rootStyles.getPropertyValue(colorVar).trim();
        const color = resolvedColor || colorVar;
        button.style.backgroundColor = color;
    });
}

// Add the colors
document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".buttons-list");
    if (!list) {
        return;
    }

    const colors = [{ name: "Red" }, { name: "Red-Orange" }, { name: "Orange" }, { name: "Yellow" }, { name: "Green" }, { name: "Blue" }, { name: "Blue-Purple" }, { name: "Purple" }];
    renderColors(list, colors);
    setSpecificButtonColor(createColorMap());
});
