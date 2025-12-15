export default class QueryRequest {
    constructor(pkgName, funcName, parameters = {}, destination) {
        if (!pkgName) throw new Error("Package name is required");
        if (!funcName) throw new Error("Function name is required");
        if (!destination) throw new Error("Destination is required");

        this.id = crypto.randomUUID();  // Client-side ID tracking
        this.pkgName = pkgName;
        this.funcName = funcName;
        this.timestamp = new Date();
        this.parameters = parameters ?? {};
        this.destination = destination;
        this.status = "queued";
    }

    normalizeParameters() {
        if (this.parameters === null) {
            console.warn("No parameters provided");
            return {};
        }

        const result = {};

        for (const [key, value] of Object.entries(this.parameters)) {

            if (
                value === null ||
                value === undefined ||
                (typeof value === "string" && value.trim() === "")
            ) {
                console.log(`Skipping ${key}`);
                continue;
            }

            if (value instanceof Date) {
                result[key] = value.toISOString();
                console.log(`Found ${key}`);
            } else {
                result[key] = value;
                console.log(`Found ${key}`);
            }
        }

        return result;
    }

    clone() {
        return new QueryRequest(
            this.pkgName,
            this.funcName,
            structuredClone(this.parameters),
            this.destination
        );
    }

    toJSON() {
        return {
            id: this.id,
            destination: this.destination,
            created_at: this.timestamp.toISOString(),
            completed_at: null,
            status: this.status,
            request: {
                package: this.pkgName,
                function: this.funcName,
                parameters: this.normalizeParameters(),
            },
        }
    }

    fmtParametersForTable() {
        const params = this.normalizeParameters();
        const entries = Object.entries(params);

        if (entries.length === 0) return "—";

        return entries
            .map(([key, value]) => {
                if (typeof value === "boolean") {
                    console.log(`Found key: '${key}', value=${value}`);
                    return `${key}=${value ? "true" : "false"}`;
                }

                return `${key}=${value}`;
            })
            .join(", ");
    }

    fmtDestinations() {
        return this.destination.join(", ");
    }

    toTableRow(onRemove) {
        const tr = document.createElement("tr");
        tr.dataset.requestId = this.id;

        tr.innerHTML = `
            <td>${this.pkgName}</td>
            <td>${this.funcName}</td>
            <td class="params-cell">${this.fmtParametersForTable()}</td>
            <td>${this.fmtDestinations()}</td>
            <td>
                <button class="remove-btn">
                    <span class="material-symbols-outlined">cancel</span>
                </button>        
            </td>
        `

        tr.querySelector(".remove-btn").addEventListener("click", () => {
            onRemove(this);
        });

        return tr;
    }

    getSignature() {
        return JSON.stringify({
            pkgName: this.pkgName,
            funcName: this.funcName,
            parameters: this.normalizeParameters(),
            destination: [...this.destination].sort(),
        });
    }
}