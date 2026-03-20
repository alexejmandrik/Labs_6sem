const URL = "https://localhost:20443/api/Save-JSON";

function getInput() {
    return {
        op: document.getElementById("op").value,
        x: Number(document.getElementById("x").value),
        y: Number(document.getElementById("y").value)
    };
}

function showResult(data) {
    document.getElementById("result").textContent =
        typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function sendGet() {
    fetch(URL)
        .then(r => r.text())
        .then(showResult);
}

function sendPost() {
    fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getInput())
    })
        .then(r => r.text())
        .then(showResult);
}

function sendPut() {
    fetch(URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getInput())
    })
        .then(r => r.text())
        .then(showResult);
}

function sendDelete() {
    fetch(URL, { method: "DELETE" })
        .then(r => r.text())
        .then(showResult);
}