let gridWidth = 0;
let gridHeight = 0;
let concentration = null;
let nextConcentration = null;
let isRunning = false;
let simulationTime = 0;
let lastUpdateTime = 0;

let params = {
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

let releasePointGridX = 0;
let releasePointGridY = 0;
let ventGridX = 0;
let ventGridY = 0;

function init(width, height, initParams) {
    gridWidth = width;
    gridHeight = height;
    concentration = new Float32Array(gridWidth * gridHeight);
    nextConcentration = new Float32Array(gridWidth * gridHeight);
    params = { ...params, ...initParams };
    updateGridPositions();
    simulationTime = 0;
}

function updateGridPositions() {
    releasePointGridX = Math.floor(params.releaseX * gridWidth / 100);
    releasePointGridY = Math.floor(params.releaseY * gridHeight / 100);
    ventGridX = Math.floor(params.ventX * gridWidth / 100);
    ventGridY = Math.floor(params.ventY * gridHeight / 100);
    
    releasePointGridX = Math.max(1, Math.min(gridWidth - 2, releasePointGridX));
    releasePointGridY = Math.max(1, Math.min(gridHeight - 2, releasePointGridY));
    ventGridX = Math.max(1, Math.min(gridWidth - 2, ventGridX));
    ventGridY = Math.max(1, Math.min(gridHeight - 2, ventGridY));
}

function getDiffusionCoefficient(temperature) {
    const baseD = 0.2;
    const T0 = 273.15;
    const T = temperature + 273.15;
    return baseD * Math.pow(T / T0, 1.75);
}

function simulateStep(deltaTime) {
    const D = getDiffusionCoefficient(params.temperature);
    const dt = deltaTime * 0.05 * params.simSpeed;
    const dx = 1.0;
    
    const releaseAmount = (params.releaseRate / 50) * dt;
    const releaseRadius = 2;
    for (let dy = -releaseRadius; dy <= releaseRadius; dy++) {
        for (let dx2 = -releaseRadius; dx2 <= releaseRadius; dx2++) {
            const dist = Math.sqrt(dx2 * dx2 + dy * dy);
            if (dist <= releaseRadius) {
                const gx = releasePointGridX + dx2;
                const gy = releasePointGridY + dy;
                if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
                    const factor = 1 - dist / releaseRadius;
                    concentration[gy * gridWidth + gx] = Math.min(1.0, 
                        concentration[gy * gridWidth + gx] + releaseAmount * factor);
                }
            }
        }
    }
    
    for (let y = 1; y < gridHeight - 1; y++) {
        for (let x = 1; x < gridWidth - 1; x++) {
            const idx = y * gridWidth + x;
            const laplacian = (
                concentration[(y - 1) * gridWidth + x] +
                concentration[(y + 1) * gridWidth + x] +
                concentration[y * gridWidth + (x - 1)] +
                concentration[y * gridWidth + (x + 1)] -
                4 * concentration[idx]
            ) / (dx * dx);
            
            nextConcentration[idx] = concentration[idx] + D * dt * laplacian;
            nextConcentration[idx] = Math.max(0, Math.min(1, nextConcentration[idx]));
        }
    }
    
    for (let y = 0; y < gridHeight; y++) {
        nextConcentration[y * gridWidth] = concentration[y * gridWidth] * 0.99;
        nextConcentration[y * gridWidth + gridWidth - 1] = concentration[y * gridWidth + gridWidth - 1] * 0.99;
    }
    for (let x = 0; x < gridWidth; x++) {
        nextConcentration[x] = concentration[x] * 0.99;
        nextConcentration[(gridHeight - 1) * gridWidth + x] = concentration[(gridHeight - 1) * gridWidth + x] * 0.99;
    }
    
    if (params.ventSize > 0) {
        const ventRadius = Math.max(1, Math.floor(params.ventSize / 15));
        const ventilationRate = params.ventSize / 100 * 0.5 * dt;
        const sealingFactor = (100 - params.sealing) / 100;
        
        for (let dy = -ventRadius; dy <= ventRadius; dy++) {
            for (let dx2 = -ventRadius; dx2 <= ventRadius; dx2++) {
                const dist = Math.sqrt(dx2 * dx2 + dy * dy);
                if (dist <= ventRadius) {
                    const gx = ventGridX + dx2;
                    const gy = ventGridY + dy;
                    if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
                        const idx = gy * gridWidth + gx;
                        const factor = (1 - dist / ventRadius) * (0.3 + sealingFactor * 0.7);
                        nextConcentration[idx] *= (1 - ventilationRate * factor);
                    }
                }
            }
        }
    }
    
    const leakageRate = (100 - params.sealing) / 100 * 0.002 * dt;
    for (let i = 0; i < nextConcentration.length; i++) {
        nextConcentration[i] *= (1 - leakageRate);
    }
    
    const temp = concentration;
    concentration = nextConcentration;
    nextConcentration = temp;
}

function loop() {
    if (!isRunning) return;
    
    const now = performance.now();
    const deltaTime = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;
    
    simulationTime += deltaTime;
    
    const steps = Math.min(Math.ceil(params.simSpeed), 5);
    for (let i = 0; i < steps; i++) {
        simulateStep(deltaTime / steps);
    }
    
    const dataCopy = new Float32Array(concentration);
    self.postMessage({
        type: 'update',
        data: Array.from(dataCopy),
        time: simulationTime
    });
    
    setTimeout(loop, 16);
}

self.onmessage = function(e) {
    switch (e.data.type) {
        case 'init':
            init(e.data.gridWidth, e.data.gridHeight, e.data.params);
            break;
        case 'start':
            params = { ...params, ...e.data.params };
            updateGridPositions();
            isRunning = true;
            lastUpdateTime = performance.now();
            loop();
            break;
        case 'pause':
            isRunning = false;
            break;
        case 'updateParams':
            params = { ...params, ...e.data.params };
            updateGridPositions();
            break;
        case 'setReleasePoint':
            params.releaseX = e.data.x;
            params.releaseY = e.data.y;
            updateGridPositions();
            break;
    }
};
