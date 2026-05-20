const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

const GRID_WIDTH = 100;
const GRID_HEIGHT = 60;
const CELL_SIZE = 8;

canvas.width = GRID_WIDTH * CELL_SIZE;
canvas.height = GRID_HEIGHT * CELL_SIZE;

let worker = null;
let isRunning = false;
let animationId = null;
let concentrationData = new Float32Array(GRID_WIDTH * GRID_HEIGHT);
let startTime = 0;
let elapsedTime = 0;

const params = {
    releaseX: 20,
    releaseY: 30,
    releaseRate: 30,
    temperature: 25,
    sealing: 80,
    ventSize: 0,
    ventX: 80,
    ventY: 30,
    simSpeed: 3
};

const elements = {
    releaseX: document.getElementById('releaseX'),
    releaseY: document.getElementById('releaseY'),
    releaseRate: document.getElementById('releaseRate'),
    temperature: document.getElementById('temperature'),
    sealing: document.getElementById('sealing'),
    ventSize: document.getElementById('ventSize'),
    ventX: document.getElementById('ventX'),
    ventY: document.getElementById('ventY'),
    simSpeed: document.getElementById('simSpeed'),
    releaseXVal: document.getElementById('releaseXVal'),
    releaseYVal: document.getElementById('releaseYVal'),
    releaseRateVal: document.getElementById('releaseRateVal'),
    temperatureVal: document.getElementById('temperatureVal'),
    sealingVal: document.getElementById('sealingVal'),
    ventSizeVal: document.getElementById('ventSizeVal'),
    ventXVal: document.getElementById('ventXVal'),
    ventYVal: document.getElementById('ventYVal'),
    simSpeedVal: document.getElementById('simSpeedVal'),
    avgConcentration: document.getElementById('avgConcentration'),
    maxConcentration: document.getElementById('maxConcentration'),
    runTime: document.getElementById('runTime'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    setReleasePoint: document.getElementById('setReleasePoint')
};

function initWorker() {
    if (worker) {
        worker.terminate();
    }
    worker = new Worker('gas-worker.js');
    
    worker.postMessage({
        type: 'init',
        gridWidth: GRID_WIDTH,
        gridHeight: GRID_HEIGHT,
        params: params
    });

    worker.onmessage = function(e) {
        if (e.data.type === 'update') {
            concentrationData = new Float32Array(e.data.data);
            elapsedTime = e.data.time;
            updateStats();
        }
    };
}

function updateStats() {
    let sum = 0;
    let max = 0;
    for (let i = 0; i < concentrationData.length; i++) {
        const val = concentrationData[i];
        sum += val;
        if (val > max) max = val;
    }
    const avg = sum / concentrationData.length;
    elements.avgConcentration.textContent = (avg * 100).toFixed(2) + '%';
    elements.maxConcentration.textContent = (max * 100).toFixed(2) + '%';
    elements.runTime.textContent = Math.floor(elapsedTime) + 's';
}

function getColor(concentration) {
    if (concentration < 0.2) {
        const alpha = concentration * 1.5;
        return `rgba(0, 255, 0, ${alpha})`;
    } else if (concentration < 0.5) {
        const t = (concentration - 0.2) / 0.3;
        return `rgba(${Math.floor(255 * t)}, 255, 0, ${0.3 + t * 0.4})`;
    } else if (concentration < 0.8) {
        const t = (concentration - 0.5) / 0.3;
        return `rgba(255, ${Math.floor(165 + 90 * (1 - t))}, 0, ${0.5 + t * 0.3})`;
    } else {
        const t = Math.min((concentration - 0.8) / 0.2, 1);
        return `rgba(255, 0, 0, ${0.7 + t * 0.3})`;
    }
}

function render() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const idx = y * GRID_WIDTH + x;
            const conc = concentrationData[idx];
            if (conc > 0.001) {
                ctx.fillStyle = getColor(conc);
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(
        params.releaseX * GRID_WIDTH / 100 * CELL_SIZE,
        params.releaseY * GRID_HEIGHT / 100 * CELL_SIZE,
        8, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('释放源', 
        params.releaseX * GRID_WIDTH / 100 * CELL_SIZE,
        params.releaseY * GRID_HEIGHT / 100 * CELL_SIZE + 22
    );

    if (params.ventSize > 0) {
        const ventWidth = Math.max(4, params.ventSize * 0.4);
        const ventHeight = Math.max(4, params.ventSize * 0.3);
        ctx.fillStyle = '#00ff88';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        const vx = params.ventX * GRID_WIDTH / 100 * CELL_SIZE;
        const vy = params.ventY * GRID_HEIGHT / 100 * CELL_SIZE;
        ctx.fillRect(vx - ventWidth, vy - ventHeight, ventWidth * 2, ventHeight * 2);
        ctx.strokeRect(vx - ventWidth, vy - ventHeight, ventWidth * 2, ventHeight * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('通风口', vx, vy + ventHeight + 18);
    }

    if (isRunning) {
        animationId = requestAnimationFrame(render);
    }
}

function startSimulation() {
    if (!worker) initWorker();
    if (startTime === 0) startTime = Date.now();
    isRunning = true;
    worker.postMessage({ type: 'start', params: params });
    render();
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
}

function pauseSimulation() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (worker) {
        worker.postMessage({ type: 'pause' });
    }
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
}

function resetSimulation() {
    pauseSimulation();
    concentrationData = new Float32Array(GRID_WIDTH * GRID_HEIGHT);
    startTime = 0;
    elapsedTime = 0;
    initWorker();
    render();
    updateStats();
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
}

function updateParams() {
    params.releaseX = parseInt(elements.releaseX.value);
    params.releaseY = parseInt(elements.releaseY.value);
    params.releaseRate = parseInt(elements.releaseRate.value);
    params.temperature = parseInt(elements.temperature.value);
    params.sealing = parseInt(elements.sealing.value);
    params.ventSize = parseInt(elements.ventSize.value);
    params.ventX = parseInt(elements.ventX.value);
    params.ventY = parseInt(elements.ventY.value);
    params.simSpeed = parseInt(elements.simSpeed.value);

    elements.releaseXVal.textContent = params.releaseX + '%';
    elements.releaseYVal.textContent = params.releaseY + '%';
    elements.releaseRateVal.textContent = params.releaseRate;
    elements.temperatureVal.textContent = params.temperature + '°C';
    elements.sealingVal.textContent = params.sealing + '%';
    elements.ventSizeVal.textContent = params.ventSize + '%';
    elements.ventXVal.textContent = params.ventX + '%';
    elements.ventYVal.textContent = params.ventY + '%';
    elements.simSpeedVal.textContent = params.simSpeed + 'x';

    if (worker) {
        worker.postMessage({ type: 'updateParams', params: params });
    }
    
    if (!isRunning) {
        render();
    }
}

elements.releaseX.addEventListener('input', updateParams);
elements.releaseY.addEventListener('input', updateParams);
elements.releaseRate.addEventListener('input', updateParams);
elements.temperature.addEventListener('input', updateParams);
elements.sealing.addEventListener('input', updateParams);
elements.ventSize.addEventListener('input', updateParams);
elements.ventX.addEventListener('input', updateParams);
elements.ventY.addEventListener('input', updateParams);
elements.simSpeed.addEventListener('input', updateParams);

elements.startBtn.addEventListener('click', startSimulation);
elements.pauseBtn.addEventListener('click', pauseSimulation);
elements.resetBtn.addEventListener('click', resetSimulation);

elements.setReleasePoint.addEventListener('click', () => {
    updateParams();
    if (worker) {
        worker.postMessage({ type: 'setReleasePoint', x: params.releaseX, y: params.releaseY });
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
        params.releaseX = Math.floor(x * 100 / GRID_WIDTH);
        params.releaseY = Math.floor(y * 100 / GRID_HEIGHT);
        elements.releaseX.value = params.releaseX;
        elements.releaseY.value = params.releaseY;
        updateParams();
        if (worker) {
            worker.postMessage({ type: 'setReleasePoint', x: params.releaseX, y: params.releaseY });
        }
    }
});

initWorker();
render();
updateStats();
elements.pauseBtn.disabled = true;
