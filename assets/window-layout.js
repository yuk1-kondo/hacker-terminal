const STORAGE_KEY = "windowLayoutV1";

// --- RESET FUNCTIONALITY ---
const resetAll = () => {
  if (confirm("Reset layout to default? This will clear all saved positions and sizes.")) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};

const createResetButton = () => {
  if (document.getElementById("reset-layout-btn")) return;
  
  const btn = document.createElement("button");
  btn.id = "reset-layout-btn";
  btn.textContent = "RESET LAYOUT";
  btn.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 9999;
    padding: 8px 12px;
    background: #da3633;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
  `;
  btn.onmouseenter = () => btn.style.opacity = "1";
  btn.onmouseleave = () => btn.style.opacity = "0.5";
  btn.onclick = resetAll;
  document.body.appendChild(btn);
};

// --- OPTIMIZATION: THROTTLE SAVE ---
let saveTimeout;
const throttledSave = (fn) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(fn, 500); // Save only once every 500ms
};

const parseTransform = (transform) => {
  if (!transform) {
    return { x: 0, y: 0 };
  }
  const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
  if (!match) {
    return { x: 0, y: 0 };
  }
  return { x: parseFloat(match[1]) || 0, y: parseFloat(match[2]) || 0 };
};

const loadLayout = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== "object") {
      return { windows: {}, extras: [] };
    }
    return {
      windows: stored.windows || {},
      extras: stored.extras || [],
    };
  } catch {
    return { windows: {}, extras: [] };
  }
};

const saveLayout = (id, values) => {
  throttledSave(() => {
    const layout = loadLayout();
    layout.windows[id] = { ...layout.windows[id], ...values };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  });
};

const saveExtras = (extras) => {
  const layout = loadLayout();
  layout.extras = extras;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
};

const applyLayout = (windowElement, id) => {
  const layout = loadLayout().windows[id];
  if (!layout) {
    return;
  }
  if (layout.hidden) {
    windowElement.style.display = "none";
    return;
  }
  const x = Number.isFinite(layout.x) ? layout.x : 0;
  const y = Number.isFinite(layout.y) ? layout.y : 0;
  windowElement.style.transform = `translate(${x}px, ${y}px)`;
  if (layout.width) {
    windowElement.style.width = `${layout.width}px`;
  }
  if (layout.height) {
    windowElement.style.height = `${layout.height}px`;
  }
};

const getWindowId = (windowElement, index) => {
  const header = windowElement.querySelector('[data-loc*="TerminalWindow.tsx:20"]');
  const title = header?.querySelector("span")?.textContent?.trim();
  return title && title.length ? `window:${title}` : `window:index:${index}`;
};

const getWindowTitle = (windowElement) => {
  const header = windowElement.querySelector('[data-loc*="TerminalWindow.tsx:20"]');
  return header?.querySelector("span")?.textContent?.trim() || "";
};

const findMainConsoleWindow = () => {
  const windows = document.querySelectorAll('[data-loc*="TerminalWindow.tsx:14"]');
  return Array.from(windows).find((windowElement) => getWindowTitle(windowElement) === "MAIN_CONSOLE");
};

const resetWindowState = (windowElement) => {
  windowElement.dataset.dragReady = "0";
  windowElement.dataset.windowId = "";
  windowElement.style.transform = "";
  windowElement.style.width = "";
  windowElement.style.height = "";
  windowElement.style.display = "";
  windowElement.classList.remove("window-dragging");
};

const cloneWindow = (template, title, block) => {
  const clone = template.cloneNode(true);
  resetWindowState(clone);

  const titleSpan = clone.querySelector('[data-loc*="TerminalWindow.tsx:20"] span');
  if (titleSpan) {
    titleSpan.textContent = title;
  }

  const content = clone.querySelector('[data-loc*="TerminalWindow.tsx:36"]');
  if (content) {
    content.innerHTML = "";
    if (block) {
      content.appendChild(block);
    }
  }

  return clone;
};

const cloneWindowElement = (template, title) => {
  const clone = template.cloneNode(true);
  resetWindowState(clone);
  const titleSpan = clone.querySelector('[data-loc*="TerminalWindow.tsx:20"] span');
  if (titleSpan) {
    titleSpan.textContent = title;
  }
  return clone;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const telemetryState = {
  cpu: 35,
  ram: 62,
  disk: 71,
  temp: 54,
  netIn: 32,
  netOut: 19,
  connections: 128,
  logs: [],
  processes: [],
  alerts: [],
  started: false,
  listeners: [],
};

const logLevels = ["INFO", "WARN", "ERROR", "DEBUG"];
const logMessages = [
  "TLS handshake complete for 10.24.3.18:443",
  "Proxy chain validated across 4 hops",
  "Kernel integrity check passed",
  "Permission elevation token issued",
  "DNS resolver cache hit (edge-pop=fsn1)",
  "Netflow export queued: batch=512",
  "Session key rotated (AES-256)",
  "Memory scrub completed for sector 0x3F",
  "Heuristic anomaly score stabilized",
  "Outbound packet jitter normalized",
  "Process sandbox exited cleanly",
  "Packet loss below threshold",
  "Telemetry frame accepted",
  "Secure channel pinned (cert_id=9f2a)",
  "Access log persisted to cold storage",
];

const processNames = [
  "netd",
  "kernel_task",
  "node",
  "syslogd",
  "authd",
  "analyzer",
  "renderer",
  "watchdog",
  "telemetryd",
  "cache-daemon",
  "trace-agent",
];

const initProcesses = () => {
  if (telemetryState.processes.length) {
    return;
  }
  telemetryState.processes = processNames.slice(0, 8).map((name, index) => ({
    pid: 420 + index * 13,
    name,
    cpu: Math.random() * 12 + 2,
    mem: Math.random() * 18 + 4,
    status: "RUN",
  }));
};

const addLogEntry = () => {
  const level = logLevels[Math.floor(Math.random() * logLevels.length)];
  const message = logMessages[Math.floor(Math.random() * logMessages.length)];
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
  telemetryState.logs.push({ level, message, timestamp });
  if (telemetryState.logs.length > 40) {
    telemetryState.logs.shift();
  }
};

const maybeAddAlert = () => {
  if (Math.random() > 0.12) {
    return;
  }
  const messages = [
    "Elevated latency detected",
    "Unauthorized scan blocked",
    "VPN hop rotated",
    "Threat signature updated",
  ];
  telemetryState.alerts.unshift({
    id: Date.now(),
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
  });
  telemetryState.alerts = telemetryState.alerts.slice(0, 3);
};

const updateTelemetry = () => {
  telemetryState.cpu = clamp(telemetryState.cpu + (Math.random() * 6 - 3), 18, 92);
  telemetryState.ram = clamp(telemetryState.ram + (Math.random() * 4 - 2), 35, 95);
  telemetryState.disk = clamp(telemetryState.disk + (Math.random() * 2 - 1), 40, 98);
  telemetryState.temp = clamp(telemetryState.temp + (Math.random() * 3 - 1.5), 38, 82);
  telemetryState.netIn = clamp(telemetryState.netIn + (Math.random() * 8 - 4), 4, 120);
  telemetryState.netOut = clamp(telemetryState.netOut + (Math.random() * 7 - 3.5), 3, 98);
  telemetryState.connections = clamp(telemetryState.connections + Math.round(Math.random() * 6 - 3), 64, 256);

  telemetryState.processes = telemetryState.processes.map((proc) => ({
    ...proc,
    cpu: clamp(proc.cpu + (Math.random() * 2 - 1), 0.5, 24),
    mem: clamp(proc.mem + (Math.random() * 2 - 1), 2, 32),
  }));

  addLogEntry();
  if (Math.random() > 0.65) {
    addLogEntry();
  }
  maybeAddAlert();

  telemetryState.listeners.forEach((listener) => listener(telemetryState));
};

const startTelemetry = () => {
  if (telemetryState.started) {
    return;
  }
  telemetryState.started = true;
  initProcesses();
  updateTelemetry();
  setInterval(updateTelemetry, 1200);
};

const subscribeTelemetry = (listener) => {
  telemetryState.listeners.push(listener);
  startTelemetry();
};

const createPanelBase = (windowElement, title) => {
  const content = windowElement.querySelector('[data-loc*="TerminalWindow.tsx:36"]');
  if (!content) {
    return null;
  }
  content.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "panel-base";
  wrapper.dataset.panelTitle = title;
  content.appendChild(wrapper);
  return wrapper;
};

const createLogPanel = (windowElement) => {
  const wrapper = createPanelBase(windowElement, "LOG_STREAM");
  if (!wrapper) {
    return;
  }
  wrapper.classList.add("panel-log");
  const logList = document.createElement("div");
  logList.className = "panel-log-list";
  wrapper.appendChild(logList);

  let lastCount = 0;
  subscribeTelemetry((state) => {
    if (state.logs.length === lastCount) {
      return;
    }
    lastCount = state.logs.length;
    logList.innerHTML = state.logs
      .map((entry) => {
        const level = entry.level.toLowerCase();
        return `<div class="log-line log-${level}"><span class="log-time">${entry.timestamp}</span><span class="log-level">${entry.level}</span><span class="log-msg">${entry.message}</span></div>`;
      })
      .join("");
    logList.scrollTop = logList.scrollHeight;
  });
};

const createSystemPanel = (windowElement) => {
  const wrapper = createPanelBase(windowElement, "SYSTEM_STATUS");
  if (!wrapper) {
    return;
  }
  wrapper.classList.add("panel-system");

  const header = document.createElement("div");
  header.className = "panel-section";
  header.innerHTML = `
    <div class="panel-title">HOST PROFILE</div>
    <div class="panel-grid">
      <div><span class="label">HOST</span><span class="value">orion-node-07</span></div>
      <div><span class="label">OS</span><span class="value">Onyx BSD 5.2</span></div>
      <div><span class="label">KERNEL</span><span class="value">v5.18.41-sec</span></div>
      <div><span class="label">REGION</span><span class="value">eu-central</span></div>
    </div>
  `;

  const metrics = document.createElement("div");
  metrics.className = "panel-section panel-metrics";
  metrics.innerHTML = `
    <div class="panel-title">LIVE METRICS</div>
    <div class="panel-grid">
      <div><span class="label">CPU</span><span class="value" data-metric="cpu"></span></div>
      <div><span class="label">RAM</span><span class="value" data-metric="ram"></span></div>
      <div><span class="label">DISK</span><span class="value" data-metric="disk"></span></div>
      <div><span class="label">TEMP</span><span class="value" data-metric="temp"></span></div>
    </div>
  `;

  wrapper.appendChild(header);
  wrapper.appendChild(metrics);

  const metricNodes = {
    cpu: metrics.querySelector('[data-metric="cpu"]'),
    ram: metrics.querySelector('[data-metric="ram"]'),
    disk: metrics.querySelector('[data-metric="disk"]'),
    temp: metrics.querySelector('[data-metric="temp"]'),
  };

  subscribeTelemetry((state) => {
    metricNodes.cpu.textContent = `${state.cpu.toFixed(0)}%`;
    metricNodes.ram.textContent = `${state.ram.toFixed(0)}%`;
    metricNodes.disk.textContent = `${state.disk.toFixed(0)}%`;
    metricNodes.temp.textContent = `${state.temp.toFixed(0)}°C`;
  });
};

const createNetworkPanel = (windowElement) => {
  const wrapper = createPanelBase(windowElement, "NETWORK_LOAD");
  if (!wrapper) {
    return;
  }
  wrapper.classList.add("panel-network");

  wrapper.innerHTML = `
    <div class="panel-section">
      <div class="panel-title">NETWORK THROUGHPUT</div>
      <div class="panel-grid">
        <div><span class="label">RX</span><span class="value" data-metric="rx"></span></div>
        <div><span class="label">TX</span><span class="value" data-metric="tx"></span></div>
        <div><span class="label">CONNECTIONS</span><span class="value" data-metric="conn"></span></div>
        <div><span class="label">UPLINK</span><span class="value">9.8 Gbps</span></div>
      </div>
    </div>
    <div class="panel-section">
      <div class="panel-title">ACTIVE PORTS</div>
      <div class="panel-list">
        <div>22/tcp  ➜  open (ssh)</div>
        <div>443/tcp ➜  open (tls)</div>
        <div>8080/tcp ➜ open (proxy)</div>
        <div>514/udp ➜  open (syslog)</div>
      </div>
    </div>
  `;

  const rx = wrapper.querySelector('[data-metric="rx"]');
  const tx = wrapper.querySelector('[data-metric="tx"]');
  const conn = wrapper.querySelector('[data-metric="conn"]');

  subscribeTelemetry((state) => {
    rx.textContent = `${state.netIn.toFixed(1)} Mb/s`;
    tx.textContent = `${state.netOut.toFixed(1)} Mb/s`;
    conn.textContent = `${state.connections}`;
  });
};

const createProcessPanel = (windowElement) => {
  const wrapper = createPanelBase(windowElement, "PROCESS_TABLE");
  if (!wrapper) {
    return;
  }
  wrapper.classList.add("panel-process");

  wrapper.innerHTML = `
    <div class="panel-title">PROCESS LIST</div>
    <div class="panel-table">
      <div class="panel-table-row panel-table-head">
        <div>PID</div><div>PROC</div><div>CPU</div><div>MEM</div><div>STATE</div>
      </div>
      <div class="panel-table-body"></div>
    </div>
  `;

  const body = wrapper.querySelector(".panel-table-body");

  subscribeTelemetry((state) => {
    body.innerHTML = state.processes
      .map(
        (proc) => `
        <div class="panel-table-row">
          <div>${proc.pid}</div>
          <div>${proc.name}</div>
          <div>${proc.cpu.toFixed(1)}%</div>
          <div>${proc.mem.toFixed(1)}%</div>
          <div>${proc.status}</div>
        </div>
      `
      )
      .join("");
  });
};

const createCommandPanel = (windowElement) => {
  const wrapper = createPanelBase(windowElement, "COMMAND" );
  if (!wrapper) {
    return;
  }
  wrapper.classList.add("panel-command");

  wrapper.innerHTML = `
    <div class="panel-title">COMMAND INTERFACE</div>
    <div class="command-output"></div>
    <div class="command-input">
      <span class="prompt">orion@core:~$</span>
      <input type="text" placeholder="type command..." />
    </div>
  `;

  const output = wrapper.querySelector(".command-output");
  const input = wrapper.querySelector("input");

  const responses = {
    help: "Available commands: scan, trace, status, ping, deploy",
    scan: "[OK] scan completed. 3 targets mapped, 0 threats found.",
    trace: "Tracing route... hop1 10ms | hop2 24ms | hop3 31ms",
    status: "STATUS: secure | firewall: active | vpn: stable",
    ping: "PING 10.24.3.18: 4 packets transmitted, 4 received",
    deploy: "Deploying patch... [######----] 62%",
  };

  const appendOutput = (text, type = "info") => {
    const line = document.createElement("div");
    line.className = `cmd-line cmd-${type}`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    const command = input.value.trim();
    if (!command) {
      return;
    }
    appendOutput(`$ ${command}`, "input");
    const responseKey = command.split(" ")[0].toLowerCase();
    appendOutput(responses[responseKey] || "Command not recognized. Type 'help'.", responseKey ? "output" : "warn");
    input.value = "";
  });
};

const createAlertToast = () => {
  if (document.getElementById("alert-toast")) {
    return;
  }
  const toast = document.createElement("div");
  toast.id = "alert-toast";
  toast.className = "alert-toast";
  document.body.appendChild(toast);

  subscribeTelemetry((state) => {
    if (!state.alerts.length) {
      toast.innerHTML = "";
      return;
    }
    toast.innerHTML = state.alerts
      .map((alert) => `<div class="alert-item"><span>${alert.timestamp}</span>${alert.message}</div>`)
      .join("");
  });
};

const initPanels = () => {
  const windows = document.querySelectorAll('[data-loc*="TerminalWindow.tsx:14"]');
  windows.forEach((windowElement) => {
    if (windowElement.dataset.panelReady === "1") {
      return;
    }
    const title = getWindowTitle(windowElement);
    if (!title) {
      return;
    }

    // Normalize title for matching
    const titleUpper = title.toUpperCase().trim();

    switch (titleUpper) {
      case "VERBOSE_LOG":
      case "LOG":
        createLogPanel(windowElement);
        windowElement.dataset.panelReady = "1";
        break;
      case "SYSTEM_STATUS":
      case "SYSTEM":
        createSystemPanel(windowElement);
        windowElement.dataset.panelReady = "1";
        break;
      case "NETWORK_LOAD":
      case "NETWORK":
        createNetworkPanel(windowElement);
        windowElement.dataset.panelReady = "1";
        break;
      case "PIE_CHART":
      case "PROCESS":
      case "PROCESSES":
        createProcessPanel(windowElement);
        windowElement.dataset.panelReady = "1";
        break;
      case "COMMAND_LINE":
      case "COMMAND":
      case "TERMINAL":
        createCommandPanel(windowElement);
        windowElement.dataset.panelReady = "1";
        break;
      default:
        // For unknown windows, try to add basic telemetry anyway
        if (!windowElement.querySelector('[data-metric]')) {
          addTelemetryToWindow(windowElement, title);
        }
        windowElement.dataset.panelReady = "1";
        break;
    }
  });

  createAlertToast();
};

// Add basic telemetry to any window
const addTelemetryToWindow = (windowElement, title) => {
  const content = windowElement.querySelector('[data-loc*="TerminalWindow.tsx:36"]');
  if (!content || content.children.length > 0) return;

  content.innerHTML = `
    <div class="panel-base">
      <div class="panel-title">${title}</div>
      <div class="panel-section">
        <div class="panel-grid">
          <div><span class="label">STATUS</span><span class="value" style="color: #00ff41;">ACTIVE</span></div>
          <div><span class="label">UPTIME</span><span class="value">${Math.floor(Math.random() * 100 + 50)}h</span></div>
        </div>
      </div>
    </div>
  `;
};

const scrubFrequencyLabels = (root) => {
  if (!root) {
    return;
  }
  const nodes = root.querySelectorAll("*");
  nodes.forEach((node) => {
    const text = node.textContent?.trim();
    if (!text) {
      return;
    }
    const upper = text.toUpperCase();
    if (upper.includes("FREQUENCY") || upper.includes("SEQUENCE")) {
      node.textContent = "";
      node.style.display = "none";
    }
  });
};

const splitMainConsole = () => {
  const mainWindow = findMainConsoleWindow();
  if (!mainWindow || mainWindow.dataset.splitReady === "1") {
    return;
  }
  mainWindow.dataset.splitReady = "1";

  const container = mainWindow.parentElement;
  if (!container) {
    return;
  }

  const headerBlock = mainWindow.querySelector('[data-loc*="Home.tsx:232"]');
  const memoryBlock = mainWindow.querySelector('[data-loc*="Home.tsx:248"]');
  const verboseBlock = mainWindow.querySelector('[data-loc*="Home.tsx:268"]');
  const commandBlock = mainWindow.querySelector('[data-loc*="Home.tsx:290"]');

  const content = mainWindow.querySelector('[data-loc*="TerminalWindow.tsx:36"]');
  if (content) {
    content.innerHTML = "";
    if (headerBlock) {
      content.appendChild(headerBlock);
    }
    scrubFrequencyLabels(content);
  }

  const titleSpan = mainWindow.querySelector('[data-loc*="TerminalWindow.tsx:20"] span');
  if (titleSpan) {
    titleSpan.textContent = "CONSOLE_HEADER";
  }

  const windowsToInsert = [];
  if (memoryBlock) {
    windowsToInsert.push(cloneWindow(mainWindow, "SECTOR_ANALYSIS", memoryBlock));
  }
  if (verboseBlock) {
    windowsToInsert.push(cloneWindow(mainWindow, "VERBOSE_LOG", verboseBlock));
  }
  if (commandBlock) {
    windowsToInsert.push(cloneWindow(mainWindow, "COMMAND_LINE", commandBlock));
  }

  let insertAfter = mainWindow;
  windowsToInsert.forEach((windowElement) => {
    container.insertBefore(windowElement, insertAfter.nextSibling);
    insertAfter = windowElement;
  });
};

const renameSecondaryGridWindows = () => {
  const container = document.querySelector('[data-loc*="Home.tsx:282"]');
  if (!container) {
    return;
  }
  const childCount = container.children.length;
  if (container.dataset.secondaryRenamed === "1" && container.dataset.secondaryCount === String(childCount)) {
    return;
  }
  container.dataset.secondaryRenamed = "1";
  container.dataset.secondaryCount = String(childCount);

  const windows = Array.from(container.children);

  // Clean removal of the first visualizer (Frequency Pulse)
  if (windows.length > 0) {
    windows[0].remove();
  }

  const remainingWindows = Array.from(container.children);

  // Rename the rest
  const titles = ["SYSTEM_STATUS", "NETWORK_LOAD", "PIE_CHART", "RADAR", "GLITCH_HUD", "PACKET_FLOW"];
  let titleIndex = 0;

  for (let i = 0; i < remainingWindows.length; i++) {
    const child = remainingWindows[i];
    const titleSpan = child.querySelector('[data-loc*="TerminalWindow.tsx:20"] span');
    if (!titleSpan) {
      continue;
    }
    if (titleIndex < titles.length) {
      titleSpan.textContent = titles[titleIndex];
      titleSpan.dataset.renamed = "1";
      titleIndex += 1;
    }
  }
};

const restoreExtras = () => {
  if (document.body.dataset.extrasRestored === "1") {
    return;
  }
  const layout = loadLayout();
  if (!layout.extras.length) {
    document.body.dataset.extrasRestored = "1";
    return;
  }
  const container = document.querySelector('[data-loc*="Home.tsx:204"]')?.parentElement || document.body;
  layout.extras.forEach((extra) => {
    if (!extra || !extra.id || !extra.sourceTitle) {
      return;
    }
    const source = Array.from(document.querySelectorAll('[data-loc*="TerminalWindow.tsx:14"]')).find(
      (windowElement) => getWindowTitle(windowElement) === extra.sourceTitle
    );
    if (!source) {
      return;
    }
    const clone = cloneWindowElement(source, extra.title || extra.sourceTitle);
    clone.dataset.windowId = extra.id;
    clone.dataset.extraWindow = "1";
    container.appendChild(clone);
  });
  document.body.dataset.extrasRestored = "1";
};

const initWindow = (windowElement, index) => {
  if (windowElement.dataset.dragReady === "1") {
    return;
  }

  const title = getWindowTitle(windowElement);
  if (title && title.toUpperCase().includes("FREQUENCY")) {
    windowElement.remove();
    return;
  }

  windowElement.dataset.dragReady = "1";

  const id = windowElement.dataset.windowId || getWindowId(windowElement, index);
  windowElement.dataset.windowId = id;

  const header = windowElement.querySelector('[data-loc*="TerminalWindow.tsx:20"]') || windowElement.firstElementChild;
  if (!header) {
    return;
  }

  const container = windowElement.parentElement;
  if (container && !container.dataset.windowLayoutRoot) {
    container.dataset.windowLayoutRoot = "1";
  }

  // Clear all positioning for regular windows - let Flexbox handle it
  if (!windowElement.dataset.extraWindow || windowElement.dataset.extraWindow !== "1") {
    windowElement.style.position = "";
    windowElement.style.left = "";
    windowElement.style.top = "";
    windowElement.style.transform = "";
    windowElement.style.width = "";
    windowElement.style.height = "";
    windowElement.dataset.positioned = "";
  } else {
    // Extra windows get absolute positioning from saved layout
    const savedLayout = loadLayout().windows[id];
    if (savedLayout && !windowElement.dataset.positioned) {
      const rect = windowElement.getBoundingClientRect();
      const containerRect = container?.getBoundingClientRect();
      const offsetX = savedLayout.x !== undefined ? savedLayout.x : (containerRect ? rect.left - containerRect.left : rect.left);
      const offsetY = savedLayout.y !== undefined ? savedLayout.y : (containerRect ? rect.top - containerRect.top : rect.top);
      windowElement.style.position = "absolute";
      windowElement.style.left = "0px";
      windowElement.style.top = "0px";
      windowElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      windowElement.dataset.positioned = "1";
    }
  }

  const handle = document.createElement("div");
  handle.className = "window-resize-handle";
  windowElement.appendChild(handle);

  const controls = document.createElement("div");
  controls.className = "window-controls";
  controls.innerHTML = "<button data-window-action=\"add\">+</button><button data-window-action=\"remove\">×</button>";
  header.appendChild(controls);

  applyLayout(windowElement, id);

  let dragStart = null;
  let resizeStart = null;

  const onPointerMove = (event) => {
    if (dragStart) {
      const dx = event.clientX - dragStart.startX;
      const dy = event.clientY - dragStart.startY;
      const nextX = dragStart.x + dx;
      const nextY = dragStart.y + dy;
      windowElement.style.transform = `translate(${nextX}px, ${nextY}px)`;
      saveLayout(id, { x: nextX, y: nextY });
    }

    if (resizeStart) {
      const dx = event.clientX - resizeStart.startX;
      const dy = event.clientY - resizeStart.startY;
      const width = Math.max(180, resizeStart.width + dx);
      const height = Math.max(140, resizeStart.height + dy);
      windowElement.style.width = `${width}px`;
      windowElement.style.height = `${height}px`;
      saveLayout(id, { width, height });
    }
  };

  const stopInteraction = () => {
    dragStart = null;
    resizeStart = null;
    windowElement.classList.remove("window-dragging");
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", stopInteraction);
  };

  const startDrag = (event) => {
    if (event.button !== 0 || event.target?.dataset?.windowAction) {
      return;
    }

    // Convert to absolute positioning on first drag
    if (!windowElement.style.position || windowElement.style.position === "relative") {
      const rect = windowElement.getBoundingClientRect();
      const containerRect = container?.getBoundingClientRect();
      const offsetX = containerRect ? rect.left - containerRect.left : rect.left;
      const offsetY = containerRect ? rect.top - containerRect.top : rect.top;

      windowElement.style.position = "absolute";
      windowElement.style.left = "0px";
      windowElement.style.top = "0px";
      windowElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      windowElement.dataset.positioned = "1";
      windowElement.dataset.wasInGrid = "1";
    }

    const { x, y } = parseTransform(windowElement.style.transform);
    dragStart = { startX: event.clientX, startY: event.clientY, x, y };
    windowElement.classList.add("window-dragging");
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", stopInteraction);
  };

  const startResize = (event) => {
    event.stopPropagation();
    if (event.button !== 0) {
      return;
    }
    resizeStart = {
      startX: event.clientX,
      startY: event.clientY,
      width: windowElement.getBoundingClientRect().width,
      height: windowElement.getBoundingClientRect().height,
    };
    windowElement.classList.add("window-dragging");
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", stopInteraction);
  };

  const addWindow = () => {
    const title = getWindowTitle(windowElement) || "CUSTOM_WINDOW";
    const id = `window:custom:${Date.now()}`;
    const extraTitle = `${title}_${Math.floor(Math.random() * 90 + 10)}`;
    const clone = cloneWindowElement(windowElement, extraTitle);
    clone.dataset.windowId = id;
    clone.dataset.extraWindow = "1";

    // Position the new window with a slight offset
    const rect = windowElement.getBoundingClientRect();
    const containerRect = container?.getBoundingClientRect();
    const offsetX = containerRect ? rect.left - containerRect.left + 30 : rect.left + 30;
    const offsetY = containerRect ? rect.top - containerRect.top + 30 : rect.top + 30;

    clone.style.position = "absolute";
    clone.style.left = "0px";
    clone.style.top = "0px";
    clone.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    clone.dataset.positioned = "1";

    container?.appendChild(clone);

    const layout = loadLayout();
    layout.extras.push({ id, sourceTitle: title, title: extraTitle });
    saveExtras(layout.extras);
    initWindow(clone, 0);
  };

  const removeWindow = () => {
    const layout = loadLayout();
    layout.windows[id] = { ...layout.windows[id], hidden: true };
    saveLayout(id, { hidden: true });
    if (windowElement.dataset.extraWindow === "1") {
      layout.extras = layout.extras.filter((extra) => extra.id !== id);
      saveExtras(layout.extras);
      windowElement.remove();
    } else {
      windowElement.style.display = "none";
    }
  };

  controls.querySelector('[data-window-action="add"]').addEventListener("click", addWindow);
  controls.querySelector('[data-window-action="remove"]').addEventListener("click", removeWindow);

  header.addEventListener("pointerdown", startDrag);
  handle.addEventListener("pointerdown", startResize);
};

const initNewsFeed = () => {
  const newsFeedContainer = document.querySelector('[data-loc*="NewsFeed.tsx"]');
  if (newsFeedContainer) {
      const windowElement = newsFeedContainer.closest('[data-loc*="TerminalWindow.tsx:14"]');
      if (windowElement && !windowElement.dataset.dragReady) {
          initWindow(windowElement, 999);
      }
  }
}

const initAll = () => {
  splitMainConsole();
  renameSecondaryGridWindows();
  restoreExtras();
  createResetButton();
  const windows = document.querySelectorAll('[data-loc*="TerminalWindow.tsx:14"]');
  windows.forEach((windowElement, index) => initWindow(windowElement, index));
  initNewsFeed();
  initPanels();
  document.body.dataset.layoutReady = "1";

  // Apply grid layout optimization
  optimizeGridLayout();

  // Re-initialize panels after a delay to catch React-rendered windows
  setTimeout(() => initPanels(), 500);
  setTimeout(() => initPanels(), 1500);
  setTimeout(() => initPanels(), 3000);
};

// New function to optimize grid layout
const optimizeGridLayout = () => {
  const root = document.getElementById('root');
  if (!root) return;

  const windows = Array.from(document.querySelectorAll('[data-loc*="TerminalWindow.tsx:14"]'));

  // Separate regular windows from extra windows
  const regularWindows = windows.filter(w => !w.dataset.extraWindow || w.dataset.extraWindow !== "1");
  const extraWindows = windows.filter(w => w.dataset.extraWindow === "1");

  // Remove absolute positioning from regular windows and let CSS Grid handle layout
  regularWindows.forEach((windowElement) => {
    // Only reset if not being dragged
    if (!windowElement.classList.contains('window-dragging')) {
      windowElement.style.position = '';
      windowElement.style.left = '';
      windowElement.style.top = '';
      windowElement.style.transform = '';
      windowElement.style.width = '';
      windowElement.style.height = '';
      windowElement.dataset.positioned = '';
    }
  });

  // Ensure extra windows have absolute positioning
  extraWindows.forEach((windowElement) => {
    if (!windowElement.style.position || windowElement.style.position === "relative") {
      if (!windowElement.classList.contains('window-dragging')) {
        // Extra windows should keep their positioning
        // If not positioned yet, give them a default position
        if (!windowElement.dataset.positioned) {
          const rect = windowElement.getBoundingClientRect();
          windowElement.style.position = "absolute";
          windowElement.style.left = "0px";
          windowElement.style.top = "0px";
          windowElement.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
          windowElement.dataset.positioned = "1";
        }
      }
    }
  });

  // Clear any grid template columns (now using Flexbox)
  root.style.gridTemplateColumns = '';
  root.style.display = '';
  root.style.gridTemplateRows = '';
};

// Re-optimize on resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    optimizeGridLayout();
  }, 250);
});

let initTimer = null;
const scheduleInit = () => {
  if (initTimer) {
    return;
  }
  initTimer = setTimeout(() => {
    initTimer = null;
    initAll();
  }, 120);
};

const observer = new MutationObserver(() => scheduleInit());

const start = () => {
  initAll();
  observer.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
