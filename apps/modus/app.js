const protocolSelect = document.getElementById("protocol");
const portInput = document.getElementById("port");
const timeoutMsInput = document.getElementById("timeoutMs");
const sessionMessage = document.getElementById("sessionMessage");
const sessionChip = document.getElementById("sessionChip");
const activeProtocol = document.getElementById("activeProtocol");
const connectionState = document.getElementById("connectionState");
const socketTargetState = document.getElementById("socketTargetState");
const remoteEndpointState = document.getElementById("remoteEndpointState");
const txLog = document.getElementById("txLog");
const rxLog = document.getElementById("rxLog");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const monitorReadButton = document.getElementById("monitorReadButton");
const workspaceTabs = document.getElementById("workspaceTabs");
const workspaceContent = document.getElementById("workspaceContent");
const monitorBlocks = document.getElementById("monitorBlocks");

const dataBlocks = [
    { id: "istantanei", label: "Istantanei", result: "Nessun dato letto." },
    { id: "diagnostica", label: "Diagnostica", result: "Nessuna diagnostica disponibile." },
    { id: "eventi", label: "Eventi", result: "Nessun evento letto." },
    { id: "storici", label: "Storici", result: "Nessuno storico letto." }
];

const state = {
    manifest: null,
    profile: null,
    section: null,
    dataResults: new Map(dataBlocks.map((block) => [block.id, block.result])),
    instantValues: null
};

function byId(id) {
    return document.getElementById(id);
}

function setBusy(isBusy) {
    startButton.disabled = isBusy;
    stopButton.disabled = isBusy;
    monitorReadButton.disabled = isBusy;
    protocolSelect.disabled = isBusy;
}

function activeProfile() {
    return state.manifest.profiles.find((profile) => profile.id === state.profile) || state.manifest.profiles[0];
}

function activeSection() {
    const profile = activeProfile();
    return profile.sections.find((section) => section.id === state.section) || profile.sections[0];
}

function updateSession(message, listening, connected, protocol) {
    sessionMessage.textContent = message;
    sessionChip.textContent = listening ? (connected ? "Device agganciato" : "In attesa device") : "Listener fermo";
    sessionChip.className = `status-chip ${listening ? "status-chip--ok" : "status-chip--idle"}`;
    activeProtocol.textContent = protocol || "Nessuno";
    connectionState.textContent = listening ? (connected ? "Sessione ricevuta" : "In ascolto") : "Non in ascolto";
}

function updateSocketTarget(text) {
    socketTargetState.textContent = text || "-";
}

function updateRemoteEndpoint(text) {
    remoteEndpointState.textContent = text || "-";
}

function protocolLabel(apiProtocol) {
    const profile = state.manifest?.profiles.find((item) => item.apiProtocol === apiProtocol || item.id === apiProtocol);
    return profile?.label || apiProtocol || "Nessuno";
}

function formatInstantValues(values) {
    if (!values) {
        return "Nessun dato letto.";
    }

    return [
        `Pressure: ${values.pressure}`,
        `Temperature: ${values.temperature}`,
        `Z: ${values.z}`,
        `C: ${values.c}`,
        `Vm: ${values.vm}`,
        `Vb: ${values.vb}`,
        `Ve: ${values.ve}`
    ].join("\n");
}

function objectMeta(object) {
    const parts = [object.key || object.obis, object.type || object.objectType];
    if (object.unit) {
        parts.push(object.unit);
    }
    if (object.obis) {
        parts.push(`OBIS ${object.obis}`);
    }
    return parts.filter(Boolean).join(" | ");
}

function renderTabs() {
    const profile = activeProfile();
    workspaceTabs.innerHTML = "";

    for (const section of profile.sections) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `tab-button ${section.id === state.section ? "tab-button--active" : ""}`;
        button.textContent = section.advanced ? `${section.label} avanzato` : section.label;
        button.addEventListener("click", () => {
            state.section = section.id;
            render();
        });
        workspaceTabs.append(button);
    }
}

function renderObjectList(section) {
    return section.objects.map((object) => `
        <article class="object-row">
            <div>
                <strong>${object.name}</strong>
                <span>${objectMeta(object)}</span>
            </div>
            <button class="button button--compact" type="button">Leggi</button>
        </article>
    `).join("");
}

function renderConfiguration(section) {
    const configSections = activeProfile().sections.filter((item) =>
        ["configuration", "calibration"].includes(item.kind)
    );

    return `
        <div class="section-heading">
            <div>
                <span class="eyebrow">Configurazione</span>
                <h2>${section.label}</h2>
            </div>
            <div class="inline-actions">
                <button class="button" type="button">Load</button>
                <button class="button button--primary" type="button">Save</button>
            </div>
        </div>
        <div class="master-detail">
            <aside class="section-picker">
                ${configSections.map((item) => `
                    <button class="${item.id === section.id ? "picker-item picker-item--active" : "picker-item"}" type="button" data-section="${item.id}">
                        <span>${item.label}</span>
                        <small>${item.objects.length} oggetti</small>
                    </button>
                `).join("")}
            </aside>
            <div class="detail-panel">
                <div class="detail-head">
                    <div>
                        <h3>${section.label}</h3>
                        <span>${section.operations.join(" / ")}</span>
                    </div>
                    <button class="button button--compact" type="button">Applica</button>
                </div>
                <div class="object-list">${renderObjectList(section)}</div>
            </div>
        </div>
    `;
}

function renderData() {
    return `
        <div class="section-heading">
            <div>
                <span class="eyebrow">Dati apparato</span>
                <h2>Istantanei, diagnostica, eventi, storici</h2>
            </div>
            <button id="readDataButton" class="button button--primary" type="button">Leggi dati</button>
        </div>
        <div class="data-grid">
            ${dataBlocks.map((block) => `
                <article class="data-card">
                    <div class="detail-head">
                        <div>
                            <h3>${block.label}</h3>
                            <span>Lettura operativa</span>
                        </div>
                        <div class="inline-actions">
                            <button class="button button--compact" type="button" data-read-block="${block.id}">Leggi</button>
                            <button class="button button--compact" type="button">Export</button>
                        </div>
                    </div>
                    <pre id="result-${block.id}">${state.dataResults.get(block.id)}</pre>
                </article>
            `).join("")}
        </div>
    `;
}

function renderFirmware(section) {
    return `
        <div class="section-heading">
            <div>
                <span class="eyebrow">Workflow operativo</span>
                <h2>Firmware</h2>
            </div>
            <div class="inline-actions">
                <button class="button" type="button">Prepara</button>
                <button class="button button--primary" type="button">Avvia download</button>
                <button class="button" type="button">Verifica</button>
            </div>
        </div>
        <div class="firmware-layout">
            <div class="form-grid">
                <label>
                    <span>File firmware o path</span>
                    <input class="field" type="text" value="" placeholder="firmware.bin" />
                </label>
                <label>
                    <span>Versione dichiarata</span>
                    <input class="field" type="text" value="" placeholder="1.0.0" />
                </label>
                <label>
                    <span>Target download</span>
                    <select class="field">
                        <option>Applicativo</option>
                        <option>Bootloader</option>
                        <option>Modulo comunicazione</option>
                    </select>
                </label>
                <label>
                    <span>Modalita operativa</span>
                    <select class="field">
                        <option>Download con device in servizio</option>
                        <option>Finestra manutenzione</option>
                    </select>
                </label>
                <label class="check-row">
                    <input type="checkbox" checked />
                    <span>Verifica post-download</span>
                </label>
            </div>
            <aside class="transfer-plan">
                <h3>Preview piano trasferimento</h3>
                <ol>
                    <li>Validazione file e versione dichiarata</li>
                    <li>Preparazione target ${activeProfile().label}</li>
                    <li>Trasferimento a blocchi</li>
                    <li>Verifica integrita e stato apparato</li>
                </ol>
                <div class="object-list">${renderObjectList(section)}</div>
            </aside>
        </div>
    `;
}

function renderTechnical(section) {
    return `
        <div class="section-heading">
            <div>
                <span class="eyebrow">Livello tecnico</span>
                <h2>${section.label}</h2>
            </div>
            <button class="button" type="button">Aggiorna inventario</button>
        </div>
        <div class="technical-table">
            ${section.objects.map((object) => `
                <article class="object-row">
                    <div>
                        <strong>${object.name}</strong>
                        <span>${objectMeta(object)}</span>
                    </div>
                    <code>${(object.functions || []).join(", ")}</code>
                </article>
            `).join("")}
        </div>
    `;
}

function renderCalibration(section) {
    return `
        <div class="section-heading">
            <div>
                <span class="eyebrow">Calibrazione HW</span>
                <h2>${section.label}</h2>
            </div>
            <div class="inline-actions">
                <button class="button" type="button">Leggi</button>
                <button class="button button--primary" type="button">Applica</button>
                <button class="button" type="button">Verifica</button>
            </div>
        </div>
        <div class="detail-panel">
            <div class="object-list">${renderObjectList(section)}</div>
        </div>
    `;
}

function renderWorkspace() {
    const section = activeSection();

    if (section.kind === "data") {
        workspaceContent.innerHTML = renderData(section);
    } else if (section.kind === "firmware") {
        workspaceContent.innerHTML = renderFirmware(section);
    } else if (section.kind === "technical") {
        workspaceContent.innerHTML = renderTechnical(section);
    } else if (section.kind === "calibration") {
        workspaceContent.innerHTML = renderCalibration(section);
    } else {
        workspaceContent.innerHTML = renderConfiguration(section);
    }

    workspaceContent.querySelectorAll("[data-section]").forEach((button) => {
        button.addEventListener("click", () => {
            state.section = button.dataset.section;
            render();
        });
    });

    workspaceContent.querySelectorAll("[data-read-block], #readDataButton").forEach((button) => {
        button.addEventListener("click", readValues);
    });
}

function renderMonitor() {
    monitorBlocks.innerHTML = dataBlocks.map((block) => `
        <article class="monitor-card">
            <div>
                <strong>${block.label}</strong>
                <span>${state.dataResults.get(block.id)}</span>
            </div>
        </article>
    `).join("");
}

function render() {
    renderTabs();
    renderWorkspace();
    renderMonitor();
}

function apiUrl(path) {
    return (window.MODUS_CONFIG?.apiBase || "") + path;
}

async function readValues() {
    setBusy(true);
    try {
        const response = await fetch(apiUrl("/api/read-values"), { method: "POST" });
        const data = await response.json();
        updateSession(data.message, data.isListening, data.isConnected, protocolLabel(data.activeProtocol));
        updateSocketTarget(data.socketTarget || socketTargetState.textContent);
        updateRemoteEndpoint(data.remoteEndpoint || remoteEndpointState.textContent);
        state.instantValues = data.instantValues;
        state.dataResults.set("istantanei", formatInstantValues(data.instantValues));
        state.dataResults.set("diagnostica", data.instantValues ? "Diagnostica base ricevuta con il frame istantanei." : "Nessuna diagnostica disponibile.");
        state.dataResults.set("eventi", "Lettura eventi pronta: binding driver da manifest.");
        state.dataResults.set("storici", "Lettura storici pronta: binding driver da manifest.");
        txLog.textContent = data.txLog || "Nessun comando trasmesso.";
        rxLog.textContent = data.rxLog || "Nessuna risposta ricevuta.";
        renderMonitor();
        if (activeSection().kind === "data") {
            renderWorkspace();
        }
    } finally {
        setBusy(false);
    }
}

protocolSelect.addEventListener("change", () => {
    state.profile = protocolSelect.value;
    const profile = activeProfile();
    state.section = profile.sections[0].id;
    state.dataResults = new Map(dataBlocks.map((block) => [block.id, block.result]));
    txLog.textContent = "Nessun comando trasmesso.";
    rxLog.textContent = "Nessuna risposta ricevuta.";
    render();
});

startButton.addEventListener("click", async () => {
    setBusy(true);
    try {
        const profile = activeProfile();
        const response = await fetch(apiUrl("/api/listen/start"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                protocol: profile.apiProtocol,
                listenPort: Number(portInput.value || 0),
                timeoutMs: Number(timeoutMsInput.value || 0)
            })
        });

        const data = await response.json();
        updateSession("Listener avviato. In attesa della connessione in ingresso dall'apparato.", true, data.isConnected, profile.label);
        updateSocketTarget(data.socketTarget);
        updateRemoteEndpoint(data.remoteEndpoint);
    } finally {
        setBusy(false);
    }
});

stopButton.addEventListener("click", async () => {
    setBusy(true);
    try {
        const response = await fetch(apiUrl("/api/listen/stop"), { method: "POST" });
        const data = await response.json();
        updateSession("Listener fermato. Nessuna connessione in ingresso accettata.", false, false, "");
        updateSocketTarget("");
        updateRemoteEndpoint("");
        state.dataResults = new Map(dataBlocks.map((block) => [block.id, block.result]));
        txLog.textContent = "Nessun comando trasmesso.";
        rxLog.textContent = "Nessuna risposta ricevuta.";
        render();
    } finally {
        setBusy(false);
    }
});

monitorReadButton.addEventListener("click", readValues);

window.addEventListener("load", async () => {
    const [manifestResponse, stateResponse] = await Promise.all([
        fetch(apiUrl("/protocol-object-map.json")),
        fetch(apiUrl("/api/state"))
    ]);

    state.manifest = await manifestResponse.json();
    const session = await stateResponse.json();
    state.profile = state.manifest.profiles[0].id;
    state.section = state.manifest.profiles[0].sections[0].id;

    protocolSelect.innerHTML = state.manifest.profiles.map((profile) =>
        `<option value="${profile.id}">${profile.label}</option>`
    ).join("");
    protocolSelect.value = state.profile;
    portInput.value = session.listeningPort || 4059;
    timeoutMsInput.value = 2000;

    updateSession("Pronto.", session.isListening, session.isConnected, protocolLabel(session.activeProtocol));
    updateSocketTarget(session.socketTarget);
    updateRemoteEndpoint(session.remoteEndpoint);
    render();
});
