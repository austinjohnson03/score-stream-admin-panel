import QueryManager from "./models/QueryManager.js";
import QueryRequest from "./models/QueryRequest.js";

/*
 * TODO:
 *  - This Sprint
 *      - Make sure date ranges are valid.
 *      - Generate JSON payloads to request calls to ScoreStream.
 *      - Generate socket connection to communicate with Hedwig.
 *  - Backlog
 *      - Show per query submission success.
 *      - Add dropdown or range check for season parameters.
 *      - Autofill functionality.
 *      - Drag and move elements to re-order instead of table buttons.
 *      - Re-design UI so it looks more sleek.
 */


let funcMap = {};
let packages = [];

const apiSelection = document.getElementById('apiSelection');
const functionSelection = document.getElementById('functionSelection');
const paramContainer = document.getElementById('paramContainer');
const destinations = document.getElementsByName('destinationRequest');

const paramAddButton = document.getElementById('paramAddButton');
const paramDirectSubmitButton = document.getElementById('paramDirectSubmitButton');

const querySubmitBtn = document.getElementById('querySubmitBtn');

const viewportTable = document.getElementById('viewportTableBody');

let queryManager = new QueryManager(viewportTable);

let qr = null;

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
    const form = document.getElementById('paramForm');

    if (!form.checkValidity()) {
        form.reportValidity();
        showToast("Please fill out required fields.", "error");
        return;
    }

    const destinationReq = parseDestinations();
    let params = collectParams();

    qr = new QueryRequest(
        toSnakeCase(apiSelection.value),
        toSnakeCase(functionSelection.value),
        params,
        destinationReq
        );

    if (queryManager.addRequest(qr)) {
        showToast("Query added successfully.", "success");
    } else {
        showToast("Duplicate query request exists.", "error");
    }
    queryManager.updateViewport(handleRemove);
    syncSubmitButton();
});

querySubmitBtn.addEventListener('click', async () => {
    if (queryManager.getCount() === 0) {
        showToast("No queries added.", "error");
        return;
    }

    await queryManager.submitRequests();
    showToast("Query successfully submitted.", "success");
    syncSubmitButton();
    queryManager.updateViewport(handleRemove);
})


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
    syncSubmitButton();
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
        input.name = toSnakeCase(key);

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

        input.name = toSnakeCase(key);
        input.required = value["Required"] === true;

        field.appendChild(label);
        field.appendChild(input);

        if (value["Required"] === true) {
            label.innerHTML = `${key}: <span class="required">*</span>`;
        }
        paramContainer.appendChild(field);
    });
}

function handleRemove(request) {
    queryManager.removeRequest(request);
    querySubmitBtn.disabled = queryManager.getCount() === 0;
    queryManager.updateViewport(handleRemove);
}

function updateButtonState(button) {
    const pkg = apiSelection.value;
    const func = functionSelection.value;

    button.disabled = !(pkg && func);
}

function parseDestinations() {
    let res = [];
    destinations.forEach(item => {
        if (item.checked)
            // If you update IDs this must also be changed.
            res.push(toSnakeCase(item.id.substring(4)));  // This works for now but find a cleaner workaround.
    });

    return res;
}

function collectParams() {
    const params = {};
    const fields = document.querySelectorAll(".param-field");

    fields.forEach(field => {
        const input = field.querySelector("input");
        if (!input) return;

        let value;

        switch (input.type) {
            case "checkbox":
                value = field.checked;
                break;

            case "number":  // Update to handle floats
                value = input.value === "" ? null : Number(input.value);
                break;

            default:
                value = input.value;
        }

        let key = toSnakeCase(input.name);
        params[key] = value;
    });

    return params;
}

function toSnakeCase(str) {
    if (!str) return "";

    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}


function showToast(msg, type = "success", duration = 3000 ) {
    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = msg;

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

function syncSubmitButton() {
   querySubmitBtn.disabled = queryManager.getCount() === 0;
}

init().then(() => {});
