let funcMap = {};
let packages = [];

const apiSelection = document.getElementById('apiSelection');
const functionSelection = document.getElementById('functionSelection');
const paramContainer = document.getElementById('paramContainer');

apiSelection.innerHTML = "<option value=\"\">Select Package</option>";
functionSelection.innerHTML = "<option value=\"\">Select Function</option>";

apiSelection.addEventListener('change', () => {
    const selectedPackage = apiSelection.value;

    if (!selectedPackage || !funcMap["Packages"][selectedPackage]) {
        loadSelectOptions(functionSelection, []);
    } else {
        const functionKeys = Object.keys(funcMap["Packages"][selectedPackage]);
        loadSelectOptions(functionSelection, functionKeys);
    }
});

functionSelection.addEventListener('change', () => {
    const pkg = apiSelection.value;
    const func = functionSelection.value;

    paramContainer.innerHTML = "";

    if (!pkg || !func) return;

    const funcDef = funcMap["Packages"][pkg][func];

    if (!funcDef || !funcDef["Params"]) return;

    buildParamField(funcDef["Params"]);

    if (funcDef["Max Limit"] !== null) {
        const note = document.createElement("p");
        note.textContent = `Max Limit: ${funcDef["Max Limit"]}`;
        paramContainer.appendChild(note);
    }
});

async function loadFuncMap() {
    try {
        const response = await fetch("function_map.json");
        if (!response.ok) new Error(response.statusText);

        const data = await response.json();
        console.log("Function map loaded!");
        return data;
    } catch (error) {
        console.error(`Failed to load func map: ${error}`);
        return {};
    }
}

async function init() {
    funcMap = await loadFuncMap();
    setupAdminPanel();
}

function setupAdminPanel() {
    if (!funcMap["Packages"]) {
        console.warn("No APIs found in function map.");
        return;
    }
    packages = Object.keys(funcMap["Packages"]);
    loadSelectOptions(apiSelection, packages);
}

function loadSelectOptions(selectElement, arr) {
    selectElement.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = selectElement.value;
    defaultOption.textContent = "Select";
    selectElement.appendChild(defaultOption);

    arr.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

function buildParamField(params) {
    Object.entries(params).forEach(([key, value]) => {
        const field = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = key;

        let input = document.createElement("input");

        switch (value.Type) {
            case "str":
                input.type = "text";
                break;

            case "bool":
                input.type = "checkbox";
                break;

            case "int":
            case "float":
                input.type = "number";
                break;

            case "datetime":
                input.type = "date";
                break;

            default:
                input.type = "text";
                break;
        }

        input.name = key;
        input.required = value["Required"] === true;

        field.appendChild(label);
        field.appendChild(input);
        paramContainer.appendChild(field);
    });
}

init().then(() => {});
