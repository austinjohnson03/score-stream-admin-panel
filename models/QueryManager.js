import QueryRequest from "./QueryRequest.js";

export default class QueryManager {
    constructor(viewport) {
        if (!(viewport instanceof HTMLTableElement)) throw new Error("Viewport must be a table element.");

        this.viewport = viewport;
        this.requests = [];
    }

    addRequest(newRequest) {
        if (!(newRequest instanceof QueryRequest)) throw new Error("Request must be a QueryRequest.");

        this.requests.push(newRequest);
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

    submitRequests() {
        // Functionality to send to payload from socket.
        // Temp functionality for testing.
        this.requests.forEach(request => {
            console.log(request.toJSON());
        });

        this.clearRequests();
    }
}