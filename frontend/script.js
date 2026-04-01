/**
 * 0/1 Knapsack Problem - Genetic Algorithm
 * Classical approach equipped with an early-stopping mechanism and a repair function.
 */

// DOM Elements
const gaForm = document.getElementById('ga-form');
const validateMsg = document.getElementById('validation-msg');
const runBtn = document.getElementById('run-btn');
const btnText = document.querySelector('.btn-text');
const spinner = document.querySelector('.spinner');
const statusBadge = document.getElementById('status-badge');

// Results Elements
const bestProfitEl = document.getElementById('best-profit');
const bestWeightEl = document.getElementById('best-weight');
const bestGenEl = document.getElementById('best-generation');
const itemsSelectedEl = document.getElementById('items-selected');
const chromosomeBitsEl = document.getElementById('chromosome-bits');

// Chart Instance
let fitnessChart = null;

// Initialize Chart.js
function initChart() {
    const ctx = document.getElementById('fitnessChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    fitnessChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Best Fitness',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 0,
                    pointHitRadius: 10
                },
                {
                    label: 'Avg Fitness',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false,
                    pointRadius: 0,
                    pointHitRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // turn off heavy animations for performance on long runs
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#e2e8f0', usePointStyle: true }
                }
            }
        }
    });
}

// Genetic Algorithm Engine
class GeneticAlgorithm {
    constructor(weights, values, maxCapacity, popSize, maxGen, mutRate, onGeneration, onComplete) {
        this.weights = weights;
        this.values = values;
        this.numItems = weights.length;
        
        this.maxCapacity = maxCapacity;
        this.popSize = popSize;
        if (this.popSize % 2 !== 0) this.popSize++; // Ensure even population
        
        this.maxGen = maxGen;
        this.mutRate = mutRate;
        
        // Callbacks for UI updates
        this.onGeneration = onGeneration;
        this.onComplete = onComplete;
        
        this.population = [];
        this.bestEver = null;
        this.bestGenFound = 0;
        
        this.currentGen = 0;
        
        // Use a flag for early stopping
        this.stagnantGens = 0;
        this.maxStagnant = Math.max(20, Math.floor(maxGen * 0.2)); 
    }
    
    initPopulation() {
        this.population = [];
        for (let i = 0; i < this.popSize; i++) {
            let chromosome = [];
            for (let j = 0; j < this.numItems; j++) {
                chromosome.push(Math.random() < 0.3 ? 1 : 0); // Start with mostly empty to help convergence
            }
            this.population.push({
                bits: chromosome,
                fitness: 0,
                weight: 0
            });
        }
        this.evaluatePopulation();
    }
    
    evaluatePopulation() {
        let genBest = null;
        let sumFitness = 0;
        
        for (let i = 0; i < this.popSize; i++) {
            let chromo = this.population[i];
            
            // Repair overwegith chromosomes (Key feature mentioned in README)
            this.repair(chromo);
            
            // Calculate fitness
            let totalVal = 0;
            let totalWeight = 0;
            
            for (let j = 0; j < this.numItems; j++) {
                if (chromo.bits[j] === 1) {
                    totalVal += this.values[j];
                    totalWeight += this.weights[j];
                }
            }
            
            chromo.fitness = totalVal;
            chromo.weight = totalWeight;
            
            sumFitness += chromo.fitness;
            
            // Update Generation Best
            if (!genBest || chromo.fitness > genBest.fitness) {
                // Need to deep copy
                genBest = {
                    bits: [...chromo.bits],
                    fitness: chromo.fitness,
                    weight: chromo.weight
                };
            }
        }
        
        // Update All-time best
        if (!this.bestEver || genBest.fitness > this.bestEver.fitness) {
            this.bestEver = genBest;
            this.bestGenFound = this.currentGen;
            this.stagnantGens = 0;
        } else {
            this.stagnantGens++;
        }
        
        // Notify UI about Generation Stats
        const avgFitness = sumFitness / this.popSize;
        this.onGeneration(this.currentGen, this.bestEver, genBest.fitness, avgFitness);
    }
    
    // Repair function (Iteratively remove items from over-weight solutions)
    repair(chromosome) {
        let weight = 0;
        // calculate weight
        for (let i = 0; i < this.numItems; i++) {
            if (chromosome.bits[i] === 1) weight += this.weights[i];
        }
        
        // If overweight, remove items greedily (worst Value/Weight ratio first) or randomly.
        // For performance and simplicity, remove randomly chosen selected items until satisfied
        // which simulates the repair strategy without complex sorting every time
        while (weight > this.maxCapacity) {
            // Find all selected items
            let selectedIndices = [];
            for (let i = 0; i < this.numItems; i++) {
                if (chromosome.bits[i] === 1) selectedIndices.push(i);
            }
            
            if (selectedIndices.length === 0) break; // Safety
            
            // Pick a random selected item and flip it
            let dropIdx = selectedIndices[Math.floor(Math.random() * selectedIndices.length)];
            chromosome.bits[dropIdx] = 0;
            weight -= this.weights[dropIdx];
        }
    }
    
    tournamentSelection() {
        // Tournament size 3
        const size = 3;
        let best = null;
        for (let i = 0; i < size; i++) {
            let index = Math.floor(Math.random() * this.popSize);
            let candidate = this.population[index];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        return { bits: [...best.bits], fitness: best.fitness, weight: best.weight };
    }
    
    uniformCrossover(parent1, parent2) {
        let child1 = [];
        let child2 = [];
        
        for (let i = 0; i < this.numItems; i++) {
            if (Math.random() > 0.5) {
                child1.push(parent1.bits[i]);
                child2.push(parent2.bits[i]);
            } else {
                child1.push(parent2.bits[i]);
                child2.push(parent1.bits[i]);
            }
        }
        
        return [
            { bits: child1, fitness: 0, weight: 0 },
            { bits: child2, fitness: 0, weight: 0 }
        ];
    }
    
    mutate(chromosome) {
        for (let i = 0; i < this.numItems; i++) {
            if (Math.random() < this.mutRate) {
                chromosome.bits[i] = chromosome.bits[i] === 1 ? 0 : 1;
            }
        }
    }
    
    nextGeneration() {
        let newPop = [];
        
        // Elitism: Preserve best from previous gen to ensure we don't regress
        newPop.push({ bits: [...this.bestEver.bits], fitness: this.bestEver.fitness, weight: this.bestEver.weight });
        // Add completely random individual to preserve diversity
        let rChromo = [];
        for(let a=0; a<this.numItems; a++) rChromo.push(Math.random()<0.2?1:0);
        newPop.push({ bits: rChromo, fitness: 0, weight: 0 });
        
        while (newPop.length < this.popSize) {
            let p1 = this.tournamentSelection();
            let p2 = this.tournamentSelection();
            
            let children = this.uniformCrossover(p1, p2);
            
            this.mutate(children[0]);
            this.mutate(children[1]);
            
            newPop.push(children[0]);
            if (newPop.length < this.popSize) {
                newPop.push(children[1]);
            }
        }
        
        this.population = newPop;
        this.currentGen++;
        this.evaluatePopulation();
    }
    
    async run() {
        this.initPopulation();
        
        const runLoop = () => {
            return new Promise((resolve) => {
                let execution = setInterval(() => {
                    // Do multiple generations per tick if maxGen is very high to prevent browser freeze
                    const chunk = Math.max(1, Math.floor(this.maxGen / 100)); // Process 1% of total gens per frame
                    
                    for(let k=0; k<chunk; k++) {
                        if (this.currentGen >= this.maxGen || this.stagnantGens >= this.maxStagnant) {
                            clearInterval(execution);
                            this.onComplete(this.bestEver, this.bestGenFound, 
                                this.stagnantGens >= this.maxStagnant ? 'Early Stopping' : 'Completed');
                            resolve();
                            return;
                        }
                        this.nextGeneration();
                    }
                }, 10);
            });
        };
        
        await runLoop();
    }
}

// ----------------------
// UI INTERACTION
// ----------------------

document.addEventListener('DOMContentLoaded', () => {
    initChart();
});

gaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Validation and Setup
    validateMsg.textContent = '';
    
    let weightsStr = document.getElementById('weights').value;
    let pricesStr = document.getElementById('prices').value;
    
    let weights = weightsStr.split(',').map(s => parseFloat(s.trim()));
    let prices = pricesStr.split(',').map(s => parseFloat(s.trim()));
    
    if (weights.length !== prices.length) {
        validateMsg.textContent = `Mismatch! You provided ${weights.length} weights and ${prices.length} profits. They must be equal.`;
        return;
    }
    
    if (weights.some(isNaN) || prices.some(isNaN)) {
        validateMsg.textContent = "Please enter valid numbers separated by commas.";
        return;
    }
    
    const capacity = parseFloat(document.getElementById('capacity').value);
    const popSize = parseInt(document.getElementById('pop-size').value);
    const generations = parseInt(document.getElementById('generations').value);
    const mutRate = parseFloat(document.getElementById('mutation-rate').value);
    
    // 2. UI State Updates
    btnText.textContent = 'Evolving...';
    spinner.classList.remove('hidden');
    runBtn.disabled = true;
    
    statusBadge.textContent = 'Running';
    statusBadge.className = 'badge running';
    
    // Reset Chart
    fitnessChart.data.labels = [];
    fitnessChart.data.datasets[0].data = [];
    fitnessChart.data.datasets[1].data = [];
    fitnessChart.update();
    
    // Reset Display
    bestProfitEl.textContent = '0';
    bestWeightEl.textContent = `0 / ${capacity}`;
    bestWeightEl.classList.remove('weight-exceeded');
    bestGenEl.textContent = '-';
    itemsSelectedEl.textContent = '0';
    chromosomeBitsEl.innerHTML = '<span class="placeholder-text">Evolving...</span>';
    
    // 3. Execution
    
    let chartUpdateAccumulator = [];
    let lastChartUpdate = Date.now();
    
    const onGeneration = (gen, bestAllTime, bestGenFit, avgGenFit) => {
        // We accumulate data points instead of triggering Chart.js update every generation
        // to prevent UI freezing for large generations (e.g. 5000+).
        chartUpdateAccumulator.push({
            gen,
            bestFit: bestGenFit,
            avgFit: avgGenFit
        });
        
        const now = Date.now();
        // Update UI every 50ms at most to keep it feeling snappy but not crashy
        if (now - lastChartUpdate > 50) {
            // Flush accumulator to chart
            chartUpdateAccumulator.forEach(point => {
                fitnessChart.data.labels.push(point.gen);
                fitnessChart.data.datasets[0].data.push(point.bestFit);
                fitnessChart.data.datasets[1].data.push(point.avgFit);
            });
            fitnessChart.update();
            chartUpdateAccumulator = [];
            lastChartUpdate = now;
            
            // Update Stats Display live
            bestProfitEl.textContent = bestAllTime.fitness.toLocaleString();
            bestWeightEl.textContent = `${bestAllTime.weight.toLocaleString()} / ${capacity}`;
            bestGenEl.textContent = gen;
            
            let selectedCount = bestAllTime.bits.filter(b => b === 1).length;
            itemsSelectedEl.textContent = `${selectedCount} / ${weights.length}`;
        }
    };
    
    const onComplete = (bestSolution, genFound, stopReason) => {
        // Flush remaining chart data
        if (chartUpdateAccumulator.length > 0) {
             chartUpdateAccumulator.forEach(point => {
                fitnessChart.data.labels.push(point.gen);
                fitnessChart.data.datasets[0].data.push(point.bestFit);
                fitnessChart.data.datasets[1].data.push(point.avgFit);
            });
            fitnessChart.update();
        }
    
        btnText.textContent = 'Run Again';
        spinner.classList.add('hidden');
        runBtn.disabled = false;
        
        statusBadge.textContent = stopReason;
        statusBadge.className = 'badge done';
        
        // Final UI Updates
        bestProfitEl.textContent = bestSolution.fitness.toLocaleString();
        bestWeightEl.textContent = `${bestSolution.weight.toLocaleString()} / ${capacity}`;
        bestGenEl.textContent = genFound;
        
        // Render Chromosome
        chromosomeBitsEl.innerHTML = '';
        
        let selectedCount = 0;
        
        for (let i = 0; i < bestSolution.bits.length; i++) {
            const bitVal = bestSolution.bits[i];
            const span = document.createElement('span');
            span.className = `bit bit-${bitVal}`;
            span.textContent = bitVal;
            
            if (bitVal === 1) selectedCount++;
            
            // Tooltip mapping to weights/prices
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `Item ${i+1}<br/>Weight: ${weights[i]}<br/>Profit: ${prices[i]}`;
            span.appendChild(tooltip);
            
            chromosomeBitsEl.appendChild(span);
        }
        
        itemsSelectedEl.textContent = `${selectedCount} / ${weights.length}`;
    };
    
    // Allow UI to repaint state changes before locking the thread
    setTimeout(() => {
        const ga = new GeneticAlgorithm(
            weights, prices, capacity, popSize, generations, mutRate, 
            onGeneration, onComplete
        );
        ga.run();
    }, 50);
});
