import QueryRequest from "./QueryRequest.js";

export default class QueryManager {
    constructor(viewport) {
        if (!(viewport instanceof HTMLTableSectionElement)) throw new Error("Viewport must be a tbody element.");

        this.viewport = viewport;
        this.requests = [];
    }

    getCount() { return this.requests.length; }

    addRequest(newRequest) {
        if (!(newRequest instanceof QueryRequest)) throw new Error("Request must be a QueryRequest.");

        if (this.isDuplicateRequest(newRequest)) {
            console.warn(`Duplicate request ${newRequest.pkgName}: ${newRequest.funcName}`);
            return false;
        }

        this.requests.push(newRequest);
        return true;
    }

    updateViewport(onRemove) {
        this.viewport.innerHTML = "";
        this.requests.forEach(request => {
            this.viewport.appendChild(request.toTableRow(onRemove));
        })
    }

    removeRequest(request) {
        if (!(request instanceof QueryRequest)) throw new Error("Request must be a QueryRequest.");

        const idx = this.requests.indexOf(request);

        if (idx >= 0) {
            this.requests.splice(idx, 1);
        } else {
            console.warn(`Request '${request.id}' not found.`);
        }
    }

    clearRequests() { this.requests = []; }

    async submitRequests() {
        if (this.getCount() === 0) return;

        try {
            const payload = this.requests.map(r => r.toJSON());

            const response = await fetch("http://localhost:3000/submit",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

            if (!response.ok) {
                console.error(`Response error: ${response.status}`);
            }

            this.clearRequests();
            return true;

        } catch (err) {
            console.error(err.message);
            return false;
        }
    }

    isDuplicateRequest(request) {
        const sig = request.getSignature();
        return this.requests.some(r => r.getSignature() === sig);
    }

}