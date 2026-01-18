/* =====================================================
   HACKER TERMINAL - ANIMATIONS & INTERACTIVITY
   ===================================================== */

// --- GLOBAL STATE ---
const state = {
  metrics: { cpu: 45, ram: 62, disk: 71, temp: 54 },
  network: { rx: 125.4, tx: 45.2, conn: 247 },
  networkData: Array(50).fill(50),
  logs: [],
  processes: [],
  commandHistory: [],
  historyIndex: -1,
  // Radar state
  radarTargets: [],
  radarAngle: 0,
  // Spectrum state
  spectrumData: Array(32).fill(0)
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initBootSequence(() => {
    initMatrixRain();
    initDateTime();
    initMetrics();
    initNetworkGraph();
    initLogs();
    initProcesses();
    initCommands();
    initThreatMonitor(); 
    initHexDump();       
    initGlitchEffect();  
    initSpectrumAnalyzer(); // New
    initWorldMap();         // New
  });
});

// --- BOOT SEQUENCE ---
function initBootSequence(callback) {
  // Create boot screen overlay
  const bootScreen = document.createElement('div');
  bootScreen.id = 'boot-screen';
  document.body.appendChild(bootScreen);

  const bootLines = [
    "BIOS Date 01/18/26 14:22:51 Ver: 08.00.15",
    "CPU: AMD Ryzen 9 5950X 16-Core Processor",
    "Speed: 3.40 GHz",
    "Press DEL to run Setup",
    "Press F11 to enter Boot Menu",
    "",
    "Checking NVRAM..",
    "Initializing USB Controllers.. Done.",
    "16384MB OK",
    "",
    "Loading Onyx BSD Kernel...",
    "[ OK ] Started Show Plymouth Boot Screen.",
    "[ OK ] Reached target Paths.",
    "[ OK ] Reached target Basic System.",
    "[ OK ] Found device /dev/mapper/root.",
    "[ OK ] Started File System Check on /dev/mapper/root.",
    "Mounting /sys/kernel/security...",
    "Mounting /sys/fs/cgroup...",
    "Starting Security Monitoring System...",
    "Initializing Network Interfaces...",
    "Establishing Uplink...",
    "ACCESS GRANTED."
  ];

  let lineIndex = 0;
  const speed = 30; // ms per line (faster than realistic for UX)

  function addLine() {
    if (lineIndex >= bootLines.length) {
      setTimeout(() => {
        bootScreen.style.opacity = '0';
        document.getElementById('dashboard').style.opacity = '1';
        setTimeout(() => {
          bootScreen.remove();
          callback();
        }, 500);
      }, 800);
      return;
    }

    const line = document.createElement('div');
    line.className = 'boot-line';
    line.textContent = bootLines[lineIndex];
    bootScreen.appendChild(line);
    
    // Auto scroll
    bootScreen.scrollTop = bootScreen.scrollHeight;

    lineIndex++;
    // Randomize speed slightly for realism
    setTimeout(addLine, speed + Math.random() * 50);
  }

  // Start boot sequence
  addLine();
}


// --- MATRIX RAIN BACKGROUND ---
function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const charArray = chars.split('');
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(40, 42, 54, 0.05)'; // Dracula Background with alpha for trail
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#50FA7B'; // Dracula Green
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = charArray[Math.floor(Math.random() * charArray.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// --- DATE TIME ---
function initDateTime() {
  const datetimeEl = document.getElementById('datetime');
  const clockTime = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');
  const clockTz = document.getElementById('clock-tz');
  if (!datetimeEl) return;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function update() {
    const now = new Date();
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    datetimeEl.textContent = now.toLocaleString('ja-JP', options);

    if (clockTime) {
      clockTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
    if (clockDate) {
      clockDate.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }
    if (clockTz) {
      const tzMatch = now.toTimeString().match(/\(([^)]+)\)/);
      clockTz.textContent = tzMatch ? tzMatch[1].toUpperCase() : 'LOCAL';
    }
  }

  update();
  setInterval(update, 1000);
}

// --- SYSTEM METRICS ---
function initMetrics() {
  const cpuValue = document.getElementById('cpu-value');
  const cpuBar = document.getElementById('cpu-bar');
  const ramValue = document.getElementById('ram-value');
  const ramBar = document.getElementById('ram-bar');
  const diskValue = document.getElementById('disk-value');
  const diskBar = document.getElementById('disk-bar');
  const tempValue = document.getElementById('temp-value');
  const tempBar = document.getElementById('temp-bar');

  function updateMetrics() {
    // CPU - more volatility
    state.metrics.cpu = clamp(state.metrics.cpu + (Math.random() - 0.5) * 15, 20, 90);
    if (cpuValue) cpuValue.textContent = Math.round(state.metrics.cpu) + '%';
    if (cpuBar) cpuBar.style.width = state.metrics.cpu + '%';

    // RAM - slow creep
    state.metrics.ram = clamp(state.metrics.ram + (Math.random() - 0.5) * 4, 40, 95);
    if (ramValue) ramValue.textContent = Math.round(state.metrics.ram) + '%';
    if (ramBar) ramBar.style.width = state.metrics.ram + '%';

    // DISK - static mostly
    state.metrics.disk = clamp(state.metrics.disk + (Math.random() - 0.5) * 0.1, 50, 98);
    if (diskValue) diskValue.textContent = Math.round(state.metrics.disk) + '%';
    if (diskBar) diskBar.style.width = state.metrics.disk + '%';

    // TEMP - follows CPU somewhat
    const targetTemp = state.metrics.cpu * 0.8 + 20;
    state.metrics.temp = state.metrics.temp * 0.9 + targetTemp * 0.1;
    if (tempValue) tempValue.textContent = Math.round(state.metrics.temp) + '°C';
    if (tempBar) tempBar.style.width = state.metrics.temp + '%';
  }

  updateMetrics();
  setInterval(updateMetrics, 1000); // Faster updates for smoother feel
}

// --- NETWORK GRAPH ---
function initNetworkGraph() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const netRx = document.getElementById('net-rx');
  const netTx = document.getElementById('net-tx');
  const netConn = document.getElementById('net-conn');

  function resize() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function updateNetwork() {
    // Update values with spikes
    const spike = Math.random() > 0.95 ? 50 : 0;
    state.network.rx = clamp(state.network.rx + (Math.random() - 0.5) * 30 + spike, 20, 300);
    state.network.tx = clamp(state.network.tx + (Math.random() - 0.5) * 20 + (spike/2), 10, 150);
    state.network.conn = clamp(state.network.conn + Math.round(Math.random() * 6 - 3), 100, 500);

    if (netRx) netRx.textContent = state.network.rx.toFixed(1) + ' Mb/s';
    if (netTx) netTx.textContent = state.network.tx.toFixed(1) + ' Mb/s';
    if (netConn) netConn.textContent = state.network.conn;

    // Update graph data
    state.networkData.shift();
    // Normalize graph data to 0-100 range roughly based on RX speed
    const newDataPoint = Math.min(100, (state.network.rx / 300) * 100 + Math.random() * 10);
    state.networkData.push(newDataPoint);
  }

  function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw data line
    const step = canvas.width / (state.networkData.length - 1);

    // Glow effect
    ctx.strokeStyle = 'rgba(80, 250, 123, 0.3)'; // Dracula Green Low Opacity
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    state.networkData.forEach((val, i) => {
      const x = i * step;
      const y = canvas.height - (val / 100) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Main line
    ctx.strokeStyle = '#50FA7B'; // Dracula Green
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.networkData.forEach((val, i) => {
      const x = i * step;
      const y = canvas.height - (val / 100) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  updateNetwork();
  setInterval(updateNetwork, 500); // Faster network updates
  setInterval(drawGraph, 50);
}

// --- LOG STREAM ---
function initLogs() {
  const container = document.getElementById('log-container');
  const countEl = document.getElementById('log-count');
  if (!container) return;

  const logMessages = [
    { level: 'info', msg: 'SSH connection established from 192.168.1.105' },
    { level: 'success', msg: 'Firewall rule #4721 applied successfully' },
    { level: 'info', msg: 'Network interface eth0: 1.2 Gbps throughput' },
    { level: 'warn', msg: 'High memory usage detected on node-07' },
    { level: 'info', msg: 'Backup completed: 2.4GB transferred' },
    { level: 'info', msg: 'TLS certificate renewed for api.cyber.net' },
    { level: 'success', msg: 'System integrity check passed' },
    { level: 'error', msg: 'Failed connection to proxy server' },
    { level: 'info', msg: 'Package manager updated 12 packages' },
    { level: 'warn', msg: 'Unusual login attempt from 203.0.113.42' },
    { level: 'info', msg: 'Disk cleanup: 1.2GB freed' },
    { level: 'success', msg: 'Service "nginx" restarted' },
    { level: 'info', msg: 'VPN tunnel established: latency 12ms' },
    { level: 'info', msg: 'Cache cleared: 847 entries removed' },
    { level: 'warn', msg: 'CPU temperature above threshold' },
    { level: 'info', msg: 'Database backup completed' },
    { level: 'success', msg: 'Security scan: 0 threats found' },
    { level: 'info', msg: 'User authentication successful' },
    { level: 'info', msg: 'Network route updated via BGP' },
    { level: 'error', msg: 'Packet loss detected on eth1' },
    { level: 'info', msg: 'Memory optimization completed' },
    { level: 'info', msg: 'Analyzing heuristic patterns...' },
    { level: 'warn', msg: 'Encrypted packet stream detected' },
    { level: 'info', msg: 'Decrypting payload...' }
  ];

  function addLog() {
    const log = logMessages[Math.floor(Math.random() * logMessages.length)];
    const timestamp = new Date().toLocaleTimeString('ja-JP', { hour12: false });

    const entry = document.createElement('div');
    entry.className = `log-entry ${log.level}`;
    entry.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-level">${log.level.toUpperCase()}</span>
      <span class="log-msg">${log.msg}</span>
    `;

    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;

    // Limit entries
    while (container.children.length > 50) {
      container.removeChild(container.firstChild);
    }

    // Update count
    if (countEl) countEl.textContent = `${container.children.length} entries`;
  }

  // Add initial logs
  for (let i = 0; i < 8; i++) {
    addLog();
  }

  // Continue adding - variable interval
  function scheduleNextLog() {
    addLog();
    setTimeout(scheduleNextLog, Math.random() * 2000 + 500);
  }
  scheduleNextLog();

  function initLogMatrix() {
    const canvas = document.getElementById('log-matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#$%*+-';
    const fontSize = 14;
    let columns = 0;
    let drops = [];

    function resize() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = 'rgba(40, 42, 54, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#50FA7B';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 60);
  }

  initLogMatrix();
}

// --- PROCESS TABLE ---
function initProcesses() {
  const container = document.getElementById('process-table');
  if (!container) return;

  const processNames = [
    'systemd', 'kernel_task', 'chrome', 'node', 'dockerd',
    'sshd', 'nginx', 'postgres', 'redis-server', 'python3',
    'mysql', 'apache2', 'containerd', 'kubelet', 'etcd'
  ];

  function createProcessRow(pid, name, cpu, mem, status) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <span>${pid}</span>
      <span>${name}</span>
      <span>${cpu.toFixed(1)}%</span>
      <span>${mem.toFixed(1)}%</span>
      <span class="status">${status}</span>
    `;
    return row;
  }

  function initProcessList() {
    container.innerHTML = '';
    state.processes = [];

    for (let i = 0; i < 8; i++) {
      const pid = 1000 + i * 137;
      const name = processNames[i % processNames.length];
      const cpu = Math.random() * 15 + 1;
      const mem = Math.random() * 20 + 2;
      const status = Math.random() > 0.1 ? 'RUN' : 'SLEEP';

      state.processes.push({ pid, name, cpu, mem, status });
      container.appendChild(createProcessRow(pid, name, cpu, mem, status));
    }
  }

  function updateProcesses() {
    state.processes.forEach(proc => {
      proc.cpu = clamp(proc.cpu + (Math.random() - 0.5) * 5, 0.1, 45); // More fluctuation
      proc.mem = clamp(proc.mem + (Math.random() - 0.5) * 1, 1, 30);
      
      // Randomly change status occasionally
      if (Math.random() > 0.95) {
          proc.status = proc.status === 'RUN' ? 'SLEEP' : 'RUN';
      }
    });

    // Rebuild DOM
    container.innerHTML = '';
    
    // Sort by CPU usage for more "top" like feel
    const sortedProcs = [...state.processes].sort((a, b) => b.cpu - a.cpu);
    
    sortedProcs.forEach(proc => {
      container.appendChild(createProcessRow(proc.pid, proc.name, proc.cpu, proc.mem, proc.status));
    });
  }

  initProcessList();
  setInterval(updateProcesses, 1500);
}

// --- COMMAND LINE ---
function initCommands() {
  const input = document.getElementById('command-input');
  const output = document.getElementById('terminal-output');
  const pulseList = document.getElementById('pulse-list');
  const flowField = document.getElementById('flow-field');
  const defragGrid = document.getElementById('defrag-grid');
  const linkList = document.getElementById('link-list');
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  if (!input || !output) return;

  const themeStorageKey = 'terminal.theme.v1';
  const themes = [
    { id: 'core', label: 'CORE', bg: '#282A36', panel: 'rgba(33, 34, 44, 0.9)', accent: '#50FA7B', highlight: '#8BE9FD', muted: '#6272A4' },
    { id: 'alert', label: 'ALERT', bg: '#2b1b22', panel: 'rgba(39, 25, 31, 0.9)', accent: '#FF5555', highlight: '#FF79C6', muted: '#80606f' },
    { id: 'stealth', label: 'STEALTH', bg: '#0f1a1f', panel: 'rgba(18, 28, 32, 0.9)', accent: '#69FF94', highlight: '#8BE9FD', muted: '#4d6b74' },
    { id: 'neon', label: 'NEON', bg: '#1a0f1f', panel: 'rgba(32, 16, 40, 0.9)', accent: '#00f5ff', highlight: '#ffb86c', muted: '#7a5c8a' },
    { id: 'sunrise', label: 'SUNRISE', bg: '#2a1c10', panel: 'rgba(45, 28, 18, 0.9)', accent: '#ffb86c', highlight: '#f1fa8c', muted: '#9b7b5c' }
  ];
  let themeIndex = 0;

  const linkStorageKey = 'terminal.quickLinks.v1';
  const defaultLinks = [
    { label: 'GITHUB', url: 'https://github.com' },
    { label: 'GOOGLE', url: 'https://www.google.com' },
    { label: 'HACKER NEWS', url: 'https://news.ycombinator.com' }
  ];

  const commands = {
    help: 'Available commands: help, scan, trace, status, ping, clear, date, whoami, neofetch, links, link-add, link-remove, link-reset',
    scan: '[OK] Network scan complete. 12 hosts found, 3 ports open.',
    trace: 'Route: localhost → gateway (2ms) → ISP (15ms) → google.com (24ms)',
    status: 'System Status: SECURE\nFirewall: ACTIVE\nVPN: CONNECTED\nThreat Level: LOW',
    ping: 'PING google.com (142.250.185.46): 56 data bytes\n64 bytes from 142.250.185.46: icmp_seq=0 ttl=117 time=24ms',
    clear: 'CLEAR',
    date: () => new Date().toString(),
    whoami: 'yuki',
    neofetch: `
       _,met$$$$$gg.          yuki@onyx-node-07
    ,g$$$$$$$$$$$$$$$P.       -----------------
  ,g$$P"     """Y$$.".        OS: Onyx BSD 5.2
 ,$$P'              \`$$$.     Host: OnyxNode X1
',$$P       ,ggs.     \`$$b:   Kernel: 5.18.41-sec
\`d$$'     ,$P"'   .    $$$    Uptime: 47 days
  $$P      d$'     ,    $$P    Shell: bash 5.1
  $$:      $$.   -    ,d$$'    Resolution: 1920x1080
  $$;      Y$b._   _,d$P'      Theme: NexusTerminal
  Y$$.    \`."Y$$$$P"'         Font: Monospace
   $$b      "-.__              CPU: AMD Ryzen @ 4.2GHz
    Y$$                        Memory: 16384MB
    \`Y$$.
      \`$$b.
        \`Y$$b.
          \`"Y$b._
              \`"""
    `
  };

  function normalizeLabel(value) {
    return value.trim().replace(/\s+/g, ' ').toUpperCase();
  }

  function sanitizeUrl(value) {
    const raw = value.trim();
    if (!raw) return null;
    const withScheme = raw.match(/^https?:\/\//i) ? raw : `https://${raw}`;
    try {
      const url = new URL(withScheme);
      return url.href;
    } catch {
      return null;
    }
  }

  function loadLinks() {
    if (!linkList) return defaultLinks;
    const stored = localStorage.getItem(linkStorageKey);
    if (!stored) return defaultLinks;
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return defaultLinks;
      return parsed.filter(item => item && typeof item.label === 'string' && typeof item.url === 'string');
    } catch {
      return defaultLinks;
    }
  }

  function saveLinks(links) {
    if (!linkList) return;
    localStorage.setItem(linkStorageKey, JSON.stringify(links));
  }

  function renderLinks(links) {
    if (!linkList) return;
    linkList.innerHTML = '';
    links.forEach(({ label, url }) => {
      const link = document.createElement('a');
      link.className = 'link-item';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = label;
      linkList.appendChild(link);
    });
  }

  let quickLinks = loadLinks();
  renderLinks(quickLinks);

  function addOutput(text) {
    const line = document.createElement('div');
    line.className = 'output-line';

    if (text === 'CLEAR') {
      output.innerHTML = '';
      return;
    }

    // Handle multiline output
    if (text.includes('\n')) {
      line.style.whiteSpace = 'pre-wrap';
      line.textContent = text;
    } else {
      line.textContent = text;
    }

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function formatLinksList(links) {
    if (!links.length) return 'No links stored.';
    return links.map((link, index) => `${index + 1}. ${link.label} -> ${link.url}`).join('\n');
  }

  function handleLinkCommand(cmdName, args) {
    if (cmdName === 'links') {
      addOutput(formatLinksList(quickLinks));
      return true;
    }

    if (cmdName === 'link-add') {
      const label = normalizeLabel(args[0] || '');
      const url = sanitizeUrl(args.slice(1).join(' '));
      if (!label || !url) {
        addOutput('Usage: link-add LABEL URL');
        return true;
      }

      const existsIndex = quickLinks.findIndex(link => link.label === label);
      if (existsIndex >= 0) {
        quickLinks[existsIndex] = { label, url };
        addOutput(`Updated link: ${label}`);
      } else {
        quickLinks.push({ label, url });
        addOutput(`Added link: ${label}`);
      }

      saveLinks(quickLinks);
      renderLinks(quickLinks);
      return true;
    }

    if (cmdName === 'link-remove') {
      const label = normalizeLabel(args.join(' '));
      if (!label) {
        addOutput('Usage: link-remove LABEL');
        return true;
      }

      const nextLinks = quickLinks.filter(link => link.label !== label);
      if (nextLinks.length === quickLinks.length) {
        addOutput(`No link found: ${label}`);
        return true;
      }

      quickLinks = nextLinks;
      saveLinks(quickLinks);
      renderLinks(quickLinks);
      addOutput(`Removed link: ${label}`);
      return true;
    }

    if (cmdName === 'link-reset') {
      quickLinks = [...defaultLinks];
      saveLinks(quickLinks);
      renderLinks(quickLinks);
      addOutput('Links reset to defaults.');
      return true;
    }

    return false;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (!cmd) return;

      addOutput(`yuki@onyx:~# ${cmd}`);

      const parts = cmd.split(' ');
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1);
      const response = commands[cmdName];

      if (handleLinkCommand(cmdName, args)) {
        state.commandHistory.push(cmd);
        state.historyIndex = state.commandHistory.length;
        input.value = '';
        return;
      }

      if (response) {
        if (typeof response === 'function') {
          addOutput(response());
        } else {
          addOutput(response);
        }
      } else {
        addOutput(`Command not found: ${cmdName}. Type 'help' for available commands.`);
      }

      state.commandHistory.push(cmd);
      state.historyIndex = state.commandHistory.length;
      input.value = '';
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.historyIndex > 0) {
        state.historyIndex--;
        input.value = state.commandHistory[state.historyIndex];
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.historyIndex < state.commandHistory.length - 1) {
        state.historyIndex++;
        input.value = state.commandHistory[state.historyIndex];
      } else {
        state.historyIndex = state.commandHistory.length;
        input.value = '';
      }
    }
  });

  function renderPulses() {
    if (!pulseList) return;
    pulseList.innerHTML = '';
    const count = Math.floor(Math.random() * 5) + 7;
    for (let i = 0; i < count; i++) {
      const pulse = document.createElement('div');
      pulse.className = 'pulse-item';
      const roll = Math.random();
      if (roll > 0.8) {
        pulse.classList.add('is-hot');
      } else if (roll > 0.35) {
        pulse.classList.add('is-cool');
      }
      pulse.style.animationDelay = `${Math.random() * 1.2}s`;
      pulse.style.animationDuration = `${Math.random() * 1.2 + 0.8}s`;
      pulse.style.opacity = `${Math.random() * 0.4 + 0.6}`;
      pulseList.appendChild(pulse);
    }
  }

  function spawnFlowParticle() {
    if (!flowField) return;
    const particle = document.createElement('div');
    particle.className = 'flow-particle';
    if (Math.random() > 0.75) {
      particle.classList.add('is-alert');
    }
    const offset = Math.random() * 70 - 35;
    particle.style.top = `calc(50% + ${offset}px)`;
    particle.style.animationDuration = `${Math.random() * 1.5 + 2.5}s`;
    particle.style.left = '0';
    const width = Math.random() * 140 + 60;
    particle.style.width = `${width}px`;
    particle.style.opacity = `${Math.random() * 0.3 + 0.7}`;

    flowField.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 4500);
  }

  function updateDefrag() {
    if (!defragGrid) return;
    if (!defragGrid.children.length) {
      const total = 120;
      for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        cell.className = 'defrag-cell';
        defragGrid.appendChild(cell);
      }
    }

    Array.from(defragGrid.children).forEach((cell) => {
      cell.classList.remove('is-active', 'is-warn');
      const roll = Math.random();
      if (roll > 0.88) {
        cell.classList.add('is-warn');
      } else if (roll > 0.7) {
        cell.classList.add('is-active');
      }
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--scene-bg', theme.bg);
    root.style.setProperty('--scene-panel', theme.panel);
    root.style.setProperty('--scene-accent', theme.accent);
    root.style.setProperty('--scene-highlight', theme.highlight);
    root.style.setProperty('--scene-muted', theme.muted);
    if (themeLabel) {
      themeLabel.textContent = `THEME: ${theme.label}`;
    }
  }

  function loadTheme() {
    const stored = localStorage.getItem(themeStorageKey);
    const matchIndex = themes.findIndex(theme => theme.id === stored);
    themeIndex = matchIndex >= 0 ? matchIndex : 0;
    applyTheme(themes[themeIndex]);
  }

  function cycleTheme() {
    themeIndex = (themeIndex + 1) % themes.length;
    const theme = themes[themeIndex];
    localStorage.setItem(themeStorageKey, theme.id);
    applyTheme(theme);
  }

  function startVisualLoops() {
    renderPulses();
    updateDefrag();
    setInterval(renderPulses, 1600);
    setInterval(spawnFlowParticle, 120);
    setInterval(updateDefrag, 1200);
  }

  loadTheme();
  if (themeToggle) {
    themeToggle.addEventListener('click', cycleTheme);
  }
  startVisualLoops();

  // Focus input on click anywhere in terminal
  document.querySelector('.command-line')?.addEventListener('click', () => {
    input.focus();
  });
}

  // --- THREAT MONITOR & RADAR ---
function initThreatMonitor() {
  const levelValue = document.getElementById('level-value');
  const threatList = document.getElementById('threat-list');
  const radarCanvas = document.getElementById('threat-radar');
  const panelContent = document.querySelector('.threat-monitor .panel-content');
  
  if (!levelValue || !threatList || !radarCanvas || !panelContent) return;

  // Radar Config
  const ctx = radarCanvas.getContext('2d');
  
  function resizeRadar() {
    // Fill the container
    radarCanvas.width = panelContent.offsetWidth;
    radarCanvas.height = panelContent.offsetHeight;
  }
  
  resizeRadar();
  window.addEventListener('resize', resizeRadar);

  // Targets
  for(let i=0; i<5; i++) {
    state.radarTargets.push({
      angle: Math.random() * Math.PI * 2,
      dist: 0.2 + Math.random() * 0.7,
      type: Math.random() > 0.8 ? 'hostile' : 'neutral',
      life: 1.0
    });
  }

  function drawRadar() {
    const w = radarCanvas.width;
    const h = radarCanvas.height;
    const cx = w/2;
    const cy = h/2;
    // Radius based on smallest dimension to fit
    const radius = Math.min(w, h) / 2 * 0.9; 

    // Clear
    ctx.clearRect(0, 0, w, h);
    
    // Draw rings
    ctx.strokeStyle = 'rgba(80, 250, 123, 0.2)'; // Dracula Green
    ctx.lineWidth = 1;
    
    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rings
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.33, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(80, 250, 123, 0.1)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    
    // Diagonal lines (X)
    const diag = radius * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - diag, cy - diag);
    ctx.lineTo(cx + diag, cy + diag);
    ctx.moveTo(cx + diag, cy - diag);
    ctx.lineTo(cx - diag, cy + diag);
    ctx.stroke();

    // Sweep line
    state.radarAngle += 0.03; // Slower, more ominous sweep
    const sx = cx + Math.cos(state.radarAngle) * radius;
    const sy = cy + Math.sin(state.radarAngle) * radius;

    // Sweep gradient
    const gradient = ctx.createLinearGradient(cx, cy, sx, sy);
    gradient.addColorStop(0, 'rgba(80, 250, 123, 0)');
    gradient.addColorStop(1, 'rgba(80, 250, 123, 0.5)');
    
    // Draw fan
    ctx.fillStyle = gradient; // Use gradient for fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, state.radarAngle - 0.5, state.radarAngle);
    ctx.fill();
    
    ctx.strokeStyle = '#50FA7B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    // Draw Targets
    state.radarTargets.forEach(target => {
      // Check if swept
      let diff = state.radarAngle - target.angle;
      // Normalize angle
      while(diff < 0) diff += Math.PI * 2;
      while(diff > Math.PI * 2) diff -= Math.PI * 2;
      
      // Flash when swept
      if(diff < 0.1) target.life = 1.0;
      else target.life *= 0.99; // Fade out slowly

      if(target.life > 0.05) {
        const tx = cx + Math.cos(target.angle) * target.dist * radius;
        const ty = cy + Math.sin(target.angle) * target.dist * radius;
        
        ctx.fillStyle = target.type === 'hostile' 
          ? `rgba(255, 85, 85, ${target.life})`  // Dracula Red
          : `rgba(139, 233, 253, ${target.life})`; // Dracula Cyan
        
        // Draw blip
        ctx.beginPath();
        ctx.arc(tx, ty, 3 + target.life * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ID text for targets with high life
        if(target.life > 0.8) {
           ctx.fillStyle = `rgba(80, 250, 123, ${target.life})`; // Dracula Green
           ctx.font = '9px monospace';
           ctx.fillText(target.type === 'hostile' ? 'TRGT' : 'UNK', tx + 8, ty - 8);
        }
      }
    });
  }

  setInterval(drawRadar, 30);

  const threats = [
    { msg: 'Port scan detected from 192.168.1.105', status: 'BLOCKED' },
    { msg: 'SQL injection attempt prevented', status: 'BLOCKED' },
    { msg: 'Brute force attack on SSH blocked', status: 'BLOCKED' },
    { msg: 'XSS attempt filtered', status: 'BLOCKED' },
    { msg: 'DDoS mitigation active', status: 'ACTIVE' },
    { msg: 'Malware signature detected and quarantined', status: 'CLEANED' },
  ];

  const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const levelColors = {
    'LOW': '#00ff41',
    'MEDIUM': '#fcee0a',
    'HIGH': '#ff6600',
    'CRITICAL': '#ff003c'
  };

  function addThreat() {
    const threat = threats[Math.floor(Math.random() * threats.length)];
    const timestamp = new Date().toLocaleTimeString('ja-JP', { hour12: false });

    const item = document.createElement('div');
    item.className = 'threat-item';
    item.innerHTML = `
      <span class="threat-time">${timestamp}</span>
      <span class="threat-msg">${threat.msg}</span>
      <span class="threat-status blocked">${threat.status}</span>
    `;

    threatList.insertBefore(item, threatList.firstChild);

    // Limit entries
    while (threatList.children.length > 5) {
      threatList.removeChild(threatList.lastChild);
    }

    // Randomly change threat level
    if (Math.random() > 0.8) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      levelValue.textContent = level;
      levelValue.style.color = levelColors[level];
      levelValue.style.textShadow = `0 0 10px ${levelColors[level]}`;
    }

    // Show alert for critical threats
    if (threat.status === 'BLOCKED' && Math.random() > 0.7) {
      showAlert(threat.msg);
    }
    
    // Add new hostile target to radar
    if(Math.random() > 0.5) {
       state.radarTargets.push({
        angle: Math.random() * Math.PI * 2,
        dist: 0.2 + Math.random() * 0.7,
        type: 'hostile',
        life: 1.0
      });
      if(state.radarTargets.length > 8) state.radarTargets.shift();
    }
  }

  function showAlert(msg) {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.innerHTML = `<span>${new Date().toLocaleTimeString()}</span> ${msg}`;

    container.appendChild(alert);

    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  // Initial threat
  setTimeout(() => addThreat(), 1000);

  // Add new threats periodically
  setInterval(() => {
    if (Math.random() > 0.7) {
      addThreat();
    }
  }, 4000);
}

// --- HEX DUMP EFFECT ---
function initHexDump() {
  const container = document.getElementById('hex-dump');
  if(!container) return;
  
  const hexChars = '0123456789ABCDEF';
  
  function generateHexLine() {
     let line = '';
     // Increase density: 8 -> 44 blocks to fill width
     for(let i=0; i<44; i++) {
        line += hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)] + ' ';
     }
     return line;
  }
  
  function updateHex() {
     const line = document.createElement('div');
     line.className = 'hex-line';
     line.textContent = generateHexLine();
     
     // Prepend so it flows "up" or "down" based on CSS direction
     // Since CSS is column-reverse, prepend actually adds to the visual bottom (which is top in DOM order)
     // Actually for column-reverse: firstChild is at the bottom visually.
     // If we want it to flow "up", we should add to DOM start (visually bottom), 
     // and older items (DOM end) will be pushed up visually.
     container.insertBefore(line, container.firstChild);
     
     // Keep buffer reasonable
     if(container.children.length > 25) {
        container.removeChild(container.lastChild);
     }
  }
  
  setInterval(updateHex, 80);
}

// --- GLITCH EFFECT ---
function initGlitchEffect() {
   const dashboard = document.getElementById('dashboard');
   
   function triggerGlitch() {
      if(Math.random() > 0.9) { // 10% chance when called
         dashboard.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
         
         setTimeout(() => {
            dashboard.style.transform = 'none';
         }, 100);
      }
   }
   
   // Check for glitch occasionally
   setInterval(triggerGlitch, 2000);
}

// --- SPECTRUM ANALYZER ---
function initSpectrumAnalyzer() {
  const canvas = document.getElementById('spectrum-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  function drawSpectrum() {
    const w = canvas.width;
    const h = canvas.height;
    const barCount = 32;
    const barWidth = w / barCount;
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(80, 250, 123, 0.5)'; // Dracula Green
    
    // Update data
    for(let i=0; i<barCount; i++) {
       // Randomly fluctuate
       let val = state.spectrumData[i] || 0;
       val += (Math.random() - 0.5) * 10;
       val = clamp(val, 0, 100);
       
       // Pull towards center frequency bias
       const centerBias = 100 - Math.abs(i - barCount/2) * 5;
       val = val * 0.8 + centerBias * 0.2 + Math.random() * 20;
       
       state.spectrumData[i] = val;
       
       // Draw bar
       const barHeight = (val / 150) * h;
       const x = i * barWidth;
       const y = h - barHeight;
       
       ctx.fillStyle = `rgba(189, 147, 249, ${val/120 + 0.3})`; // Dracula Purple dynamic opacity
       ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
    
    requestAnimationFrame(drawSpectrum);
  }
  
  drawSpectrum();
}

// --- WORLD MAP ---
function initWorldMap() {
  const panel = document.querySelector('.map-pings');
  const mapPanel = document.querySelector('.world-map-panel');
  if (!panel || !mapPanel) return;

  const scanLine = document.createElement('div');
  scanLine.className = 'map-scan-line';
  mapPanel.appendChild(scanLine);

  function ping() {
    const dot = document.createElement('div');
    dot.className = 'ping-dot';

    const x = Math.random() * 100;
    const y = Math.random() * 100;

    dot.style.left = x + '%';
    dot.style.top = y + '%';

    panel.appendChild(dot);

    setTimeout(() => {
      dot.remove();
    }, 2000);

    setTimeout(ping, Math.random() * 1000 + 200);
  }

  ping();
}

// --- UTILITY FUNCTIONS ---
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
