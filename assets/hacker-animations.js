/* =====================================================
   HACKER TERMINAL - ANIMATIONS & EFFECTS
   Auto-generating data streams, animations, and effects
   ===================================================== */

// Wait for DOM to be ready
const startAnimations = () => {
  // Create matrix rain background
  createMatrixRain();

  // Start data updates
  startDataStream();

  // Start system metrics simulation
  startSystemMetrics();

  // Start log stream
  startLogStream();

  // Start hex code background
  createHexBackground();

  // Apply glitch effect to headers
  applyGlitchEffects();

  // Start network activity simulation
  startNetworkSimulation();
};

// --- MATRIX RAIN EFFECT ---
const createMatrixRain = () => {
  // Check if matrix container already exists
  if (document.getElementById('matrix-rain')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-rain';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.15;
    pointer-events: none;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const charArray = chars.split('');
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);

  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = charArray[Math.floor(Math.random() * charArray.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };

  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
};

// --- DATA STREAM UPDATES ---
const startDataStream = () => {
  // Update all numeric values periodically
  const updateValues = () => {
    // Find all elements with data-update attribute
    const valueElements = document.querySelectorAll('[data-metric], .value, [class*="value"]');

    valueElements.forEach(el => {
      if (el.dataset.metric && Math.random() > 0.7) {
        const currentValue = parseFloat(el.textContent);
        if (!isNaN(currentValue)) {
          const change = (Math.random() - 0.5) * 10;
          const newValue = Math.max(0, Math.min(100, currentValue + change));
          el.textContent = newValue.toFixed(1) + (el.textContent.includes('%') ? '%' : '');
          el.classList.add('data-stream');
          setTimeout(() => el.classList.remove('data-stream'), 500);
        }
      }
    });
  };

  setInterval(updateValues, 1500);
};

// --- SYSTEM METRICS SIMULATION ---
const startSystemMetrics = () => {
  const metrics = {
    cpu: { value: 35, element: null },
    ram: { value: 62, element: null },
    disk: { value: 71, element: null },
    temp: { value: 45, element: null },
    netIn: { value: 32, element: null },
    netOut: { value: 19, element: null },
  };

  // Find metric elements after a delay
  setTimeout(() => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const text = el.textContent?.toLowerCase() || '';
      if (text.includes('cpu') && el.dataset.metric === 'cpu') metrics.cpu.element = el;
      if (text.includes('ram') && el.dataset.metric === 'ram') metrics.ram.element = el;
      if (text.includes('disk') && el.dataset.metric === 'disk') metrics.disk.element = el;
      if (text.includes('temp') && el.dataset.metric === 'temp') metrics.temp.element = el;
      if (text.includes('rx') || text.includes('net in')) metrics.netIn.element = el;
      if (text.includes('tx') || text.includes('net out')) metrics.netOut.element = el;
    });
  }, 2000);

  const updateMetrics = () => {
    Object.keys(metrics).forEach(key => {
      const metric = metrics[key];
      metric.value = Math.max(10, Math.min(95, metric.value + (Math.random() - 0.5) * 15));

      if (metric.element) {
        let displayValue = metric.value.toFixed(0);
        if (key === 'temp') displayValue += '°C';
        else if (key === 'netIn' || key === 'netOut') displayValue += ' Mb/s';
        else displayValue += '%';

        metric.element.textContent = displayValue;
      }
    });
  };

  setInterval(updateMetrics, 1200);
};

// --- LOG STREAM ---
const startLogStream = () => {
  const logMessages = [
    '[SCAN] Port 443: OPEN (TLS 1.3)',
    '[NET] Incoming packet from 192.168.1.105',
    '[SYS] Kernel integrity verified',
    '[AUTH] SSH key exchange complete',
    '[FIREWALL] Blocked suspicious request',
    '[PROXY] Routing through node alpha-7',
    '[CRYPTO] AES-256 key rotation',
    '[NET] Bandwidth: 1.2 Gbps',
    '[SCAN] Network topology mapped',
    '[SEC] Threat signature updated',
    '[DB] Query executed in 12ms',
    '[CACHE] Redis hit rate: 94.2%',
    '[API] Response time: 45ms',
    '[LOG] Rotation complete',
    '[MONITOR] CPU threshold OK',
    '[BACKUP] Incremental saved',
    '[SYNC] Data replication complete',
    '[DNS] Query resolved in 8ms',
    '[PROXY] Active connections: 247',
    '[FIREWALL] Rule #4721 matched',
    '[SCAN] Vulnerability assessment: CLEAN',
  ];

  const logLevels = ['INFO', 'WARN', 'DEBUG', 'SUCCESS'];

  const findLogContainer = () => {
    return document.querySelector('.panel-log-list, [class*="log"], [data-loc*="verbose"]');
  };

  const addLogEntry = () => {
    const container = findLogContainer();
    if (!container) return;

    const level = logLevels[Math.floor(Math.random() * logLevels.length)];
    const message = logMessages[Math.floor(Math.random() * logMessages.length)];
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    const logEntry = document.createElement('div');
    logEntry.className = `log-line log-${level.toLowerCase()} data-stream`;
    logEntry.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-level">[${level}]</span>
      <span class="log-msg">${message}</span>
    `;

    container.appendChild(logEntry);
    container.scrollTop = container.scrollHeight;

    // Keep only last 50 entries
    while (container.children.length > 50) {
      container.removeChild(container.firstChild);
    }
  };

  // Add initial logs
  for (let i = 0; i < 10; i++) {
    setTimeout(() => addLogEntry(), i * 100);
  }

  // Continue adding logs periodically
  setInterval(addLogEntry, 2500);
};

// --- HEX CODE BACKGROUND ---
const createHexBackground = () => {
  const addHexToWindows = () => {
    const windows = document.querySelectorAll('[data-loc*="TerminalWindow"], .border-2');

    windows.forEach(window => {
      if (window.querySelector('.hex-bg')) return;

      const hexBg = document.createElement('div');
      hexBg.className = 'hex-bg';

      let hex = '';
      for (let i = 0; i < 500; i++) {
        hex += Math.floor(Math.random() * 16).toString(16).toUpperCase() + ' ';
      }
      hexBg.textContent = hex;

      window.style.position = 'relative';
      window.style.overflow = 'hidden';
      window.insertBefore(hexBg, window.firstChild);
    });
  };

  setTimeout(addHexToWindows, 1000);
  setInterval(addHexToWindows, 5000);
};

// --- GLITCH EFFECT ---
const applyGlitchEffects = () => {
  setTimeout(() => {
    const headers = document.querySelectorAll('[data-loc*="TerminalWindow.tsx:20"] span, .bg-primary span');

    headers.forEach(header => {
      header.classList.add('glitch');
      header.setAttribute('data-text', header.textContent);

      // Trigger glitch periodically
      setInterval(() => {
        if (Math.random() > 0.9) {
          header.style.animation = 'none';
          setTimeout(() => {
            header.style.animation = '';
          }, 10);
        }
      }, 3000);
    });
  }, 1500);
};

// --- NETWORK SIMULATION ---
const startNetworkSimulation = () => {
  const createNetworkGraph = () => {
    const findContainer = () => {
      return document.querySelector('.panel-network, [data-loc*="network"], [data-loc*="NETWORK_LOAD"]');
    };

    const container = findContainer();
    if (!container || container.querySelector('.network-graph')) return;

    const graph = document.createElement('div');
    graph.className = 'network-graph';
    graph.style.cssText = `
      height: 100px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #008f11;
      margin-top: 10px;
      position: relative;
      overflow: hidden;
    `;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      width: 100%;
      height: 100%;
    `;
    graph.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dataPoints = Array(50).fill(50);

    const drawGraph = () => {
      canvas.width = graph.offsetWidth;
      canvas.height = graph.offsetHeight;

      // Shift data and add new point
      dataPoints.shift();
      dataPoints.push(30 + Math.random() * 40);

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * canvas.height / 4);
        ctx.lineTo(canvas.width, i * canvas.height / 4);
        ctx.stroke();
      }

      // Draw line
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dataPoints.forEach((point, i) => {
        const x = (i / (dataPoints.length - 1)) * canvas.width;
        const y = canvas.height - (point / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw glow
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
      ctx.lineWidth = 6;
      ctx.stroke();
    };

    setInterval(drawGraph, 100);
    container.appendChild(graph);
  };

  setTimeout(createNetworkGraph, 2000);
};

// --- PROCESS TABLE UPDATES ---
const startProcessUpdates = () => {
  const processNames = ['systemd', 'kernel', 'chrome', 'node', 'docker', 'sshd', 'nginx', 'postgres', 'redis', 'python'];
  const processTable = document.querySelector('.panel-table-body');

  if (!processTable) return;

  setInterval(() => {
    const rows = processTable.querySelectorAll('.panel-table-row');
    rows.forEach(row => {
      const cpuCell = row.children[2];
      const memCell = row.children[3];

      if (cpuCell && memCell && Math.random() > 0.7) {
        const newCpu = (Math.random() * 15).toFixed(1);
        const newMem = (Math.random() * 10 + 2).toFixed(1);
        cpuCell.textContent = newCpu + '%';
        memCell.textContent = newMem + '%';
      }
    });
  }, 2000);
};

// --- START WHEN DOM IS READY ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAnimations);
} else {
  startAnimations();
}

// Also start when React has rendered
setTimeout(startAnimations, 2000);
setTimeout(startAnimations, 5000);

export { startAnimations };
