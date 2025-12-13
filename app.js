import QueryManager from "./models/QueryManager.js";
import QueryRequest from "./models/QueryRequest.js";

/*
 * TODO:
 *  - Add functionality for buttons under param query.
 *  - Create viewport functionality.
 *  - Remove query functionality.
 *  - Duplicate query prevention.
 *      - From DB (long-term) & in viewport(this sprint).
 *  - Generate socket connection to communicate with Hedwig.
 *  - Generate JSON payloads to request calls to ScoreStream.
 *  - Add dropdown or range check for season parameters.
 *  - Make sure date ranges are valid.
 *  - Autofill functionality.
 *  - Drag and move elements to re-order instead of table buttons.
 *  - Re-design UI so it looks more sleek.
 */


let funcMap = {};
let packages = [];

const apiSelection = document.getElementById('apiSelection');
const functionSelection = document.getElementById('functionSelection');
const paramContainer = document.getElementById('paramContainer');
const destinationReq = document.getElementById('destinationRequest');

const paramAddButton = document.getElementById('paramAddButton');
const paramDirectSubmitButton = document.getElementById('paramDirectSubmitButton');

const viewportTable = document.getElementById('viewportTable');

let queryManager = new QueryManager(viewportTable);

paramAddButton.disabled = true;
paramDirectSubmitButton.disabled = true;

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

    paramContainer.innerHTML = "";
    updateButtonState(paramAddButton);
    updateButtonState(paramDirectSubmitButton);
});

functionSelection.addEventListener('change', () => {
    const pkg = apiSelection.value;
    const func = functionSelection.value;

    paramContainer.innerHTML = "";

    if (!pkg || !func) {
        updateButtonState(paramAddButton);
        updateButtonState(paramDirectSubmitButton);
        return;
    }

    const funcDef = funcMap["Packages"][pkg][func];

    if (!funcDef || !funcDef["Params"]) {
        updateButtonState(paramAddButton);
        updateButtonState(paramDirectSubmitButton);
        return;
    }

    buildParamField(funcDef["Params"]);

    if (funcDef["Max Limit"] !== null) {
        const note = document.createElement("p");
        note.textContent = `Max Return Limit: ${funcDef["Max Limit"]}`;
        note.classList.add("maxLimit");
        paramContainer.appendChild(note);
    }

    updateButtonState(paramAddButton);
    updateButtonState(paramDirectSubmitButton);
});

paramAddButton.addEventListener('click', () => {
    request = new QueryRequest(
        apiSelection.value,
        functionSelection.value,
        paramContainer,
        destinationReq
        );
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
        field.classList.add("param-field");

        const label = document.createElement("label");
        label.textContent = `${key}:`;

        let input = document.createElement("input");

        switch (value["Type"]) {
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

        if (value["Required"] === true) {
            field.classList.add("required");
        }
        paramContainer.appendChild(field);
    });
}

function updateButtonState(button) {
    const pkg = apiSelection.value;
    const func = functionSelection.value;

    button.disabled = !(pkg && func);
}

init().then(() => {});
