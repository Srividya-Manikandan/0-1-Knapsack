# 🧬 Genetic Algorithm for the 0/1 Knapsack Problem  

> *An experimental study on how classical Genetic Algorithms behave — and how a simple repair strategy makes them scalable and reliable.*

---

## 📌 Overview
This project investigates the performance of a **Classical Genetic Algorithm (GA)** in solving the **0/1 Knapsack Problem**, a well-known NP-hard combinatorial optimization problem.  

Our focus is not just on obtaining solutions, but on understanding:
- Convergence behavior  
- Stability across multiple runs  
- Solution quality  
- Scalability across different dataset sizes  

To handle infeasible (overweight) solutions, we introduce a **repair mechanism**, which significantly improves GA performance on medium and large datasets.

---

## 🎯 Problem Statement
The 0/1 Knapsack Problem aims to **maximize total profit** while ensuring that the **total weight does not exceed capacity**.  
Classical deterministic approaches struggle with scalability, making **evolutionary algorithms** a suitable alternative.

---

## 🧠 Methodology
- Binary chromosome representation (1 → item selected, 0 → not selected)
- Classical GA operators:
  - Tournament Selection  
  - Uniform Crossover  
  - Bit-Flip Mutation  
  - Elitism
- Early stopping based on convergence stability
- Multiple independent runs to account for stochastic behavior

### 🔧 Repair Function (Key Idea)
Overweight chromosomes are **repaired** by iteratively removing selected items until the knapsack constraint is satisfied.  
This ensures:
- Feasible solutions at every generation  
- Improved convergence  
- Better scalability for large problem instances  

---

## 📊 Experiments
The algorithm was tested on:
- Small datasets (5–10 items)
- Medium datasets (15–50 items)
- Large benchmark datasets (200–500 items)

Each dataset was executed multiple times to analyze:
- Average fitness
- Runtime
- Convergence trends
- Consistency across runs

---

## ✅ Results Summary
- **Small datasets:** Consistent near-optimal or optimal solutions
- **Without repair:** GA fails on large datasets due to infeasible solutions
- **With repair:**  
  - Stable convergence  
  - Feasible high-quality solutions  
  - Significant performance improvement  

📌 The repair mechanism transforms classical GA into a **practical optimization tool**.

---

## 🧪 Technologies Used
- Python  
- NumPy  
- Matplotlib
- HTML, CSS, Vanilla JavaScript
- Chart.js (Visualization)  

---

## 📁 Project Structure
```
0-1-Knapsack-GA/
├── src/                    # Source code
│   └── Knapsack_BenchmarkDataset.py
├── data/                   # Input data files
│   └── knapsack_input.csv
├── frontend/               # Web visualization
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docs/                   # Additional documentation
├── README.md               # This file
└── .git/                   # Git repository
```

---

## 🌐 Frontend Visualization
A web-based interface to visualize the Genetic Algorithm concepts:
- Real-time fitness evolution charts
- Population distribution
- Best solution display

To run the frontend:
1. Open `frontend/index.html` in a web browser
2. Click "Run GA" to see the simulation

The frontend uses Chart.js for visualizations and features a pleasant green color scheme.

---

## 🚀 Future Enhancements
- Adaptive crossover and mutation rates  
- Hybrid GA (GA + PSO / ACO / local search)  
- Multi-objective knapsack problems  
- Parallel and distributed GA implementations  

---

## 👥 Contributor Roles

This project was a collaborative effort, with each member owning a core technical domain:

* **Adwaitha :** Core System Logic, Adaptive Parameter Tuning, and Final Benchmarking Pipeline.
* **Nethra :** Implementation of all Genetic Operators (Selection, Crossover, Mutation) and the Fitness Function.
* **Srividya :** Design and implementation of the Constraint Repair Mechanism and ensuring solution feasibility.

---

## ⭐ Why This Project?
This work:
- Analyzes the **strengths and limitations** of classical GA  
- Demonstrates the importance of **constraint handling**  
- Provides a strong foundation for hybrid and adaptive evolutionary algorithms  

---
