import random
import pandas as pd
import time
import ast

# -----------------------------
# Helper functions
# -----------------------------

def generate_individual(num_items):
    return [random.randint(0, 1) for _ in range(num_items)]

def generate_population(num_items, population_size):
    return [generate_individual(num_items) for _ in range(population_size)]

def fitness(individual, values, weights, capacity):
    total_value = 0
    total_weight = 0
    for gene, value, weight in zip(individual, values, weights):
        if gene == 1:
            total_value += value
            total_weight += weight
    if total_weight > capacity:
        return 0
    return total_value

def tournament_selection(population, values, weights, capacity, k=5):
    tournament = random.sample(population, k)
    tournament.sort(key=lambda ind: fitness(ind, values, weights, capacity), reverse=True)
    return tournament[0]

def uniform_crossover(parent1, parent2):
    return [p1 if random.random() < 0.5 else p2 for p1, p2 in zip(parent1, parent2)]

def mutate(individual, num_items, mutation_rate):
    for i in range(num_items):
        if random.random() < mutation_rate:
            individual[i] = 1 - individual[i]
    return individual

# -----------------------------
# Repair function
# -----------------------------
def repair(individual, weights, capacity):
    while sum(w for g, w in zip(individual, weights) if g) > capacity:
        ones_idx = [i for i, g in enumerate(individual) if g == 1]
        if not ones_idx:
            break
        idx_to_remove = random.choice(ones_idx)
        individual[idx_to_remove] = 0
    return individual

# -----------------------------
# Genetic Algorithm Core
# -----------------------------
def genetic_algorithm(run_number, values, weights, capacity, observed_answer):
    start_time = time.time()
    num_items = len(values)

    # Dynamically tuned parameters
    population_size = max(50, num_items // 2)
    num_generations = max(500, num_items)
    mutation_rate = min(0.05, 1 / num_items * 10)
    early_stop_threshold = max(20, num_items // 20)
    min_generations = 50

    # Initialize population
    population = generate_population(num_items, population_size)
    best_solution = [0] * num_items
    best_fitness = 0
    no_improvement_count = 0
    generation_cutoff = 0

    for generation in range(num_generations):
        # Sort population by fitness
        population.sort(key=lambda ind: fitness(ind, values, weights, capacity), reverse=True)

        # Elitism (keep best 2)
        elites = population[:2]
        new_population = elites.copy()
        improvement_this_generation = False

        for _ in range(population_size - len(elites)):
            parent1 = tournament_selection(population, values, weights, capacity)
            parent2 = tournament_selection(population, values, weights, capacity)
            child = uniform_crossover(parent1, parent2)
            child = mutate(child, num_items, mutation_rate)
            child = repair(child, weights, capacity)  # Ensure feasible
            new_population.append(child)

            fit = fitness(child, values, weights, capacity)
            if fit > best_fitness:
                best_fitness = fit
                best_solution = child
                improvement_this_generation = True

        population = new_population

        # Early stopping
        if generation + 1 > min_generations:
            if improvement_this_generation:
                no_improvement_count = 0
            else:
                no_improvement_count += 1

        if no_improvement_count >= early_stop_threshold:
            generation_cutoff = generation + 1
            break

    if generation_cutoff == 0:
        generation_cutoff = num_generations

    total_weight = sum(w for g, w in zip(best_solution, weights) if g)
    end_time = time.time()
    time_taken = round(end_time - start_time, 4)
    error = observed_answer - best_fitness
    num_selected = sum(best_solution)

    print(f"✅ Run {run_number} done | Best Fitness: {best_fitness} | Observed: {observed_answer}")

    return {
        "Run No": run_number,
        "Num Items": num_items,
        "Best Fitness (Calculated)": best_fitness,
        "Observed Answer": observed_answer,
        "Error": error,
        "Time Taken (s)": time_taken,
        "Stopped At Generation": generation_cutoff,
        "Total Weight": total_weight,
        "Selected Items": str(best_solution)
    }

# -----------------------------
# Run for dataset
# -----------------------------
def run_all(dataset_file):
    data = pd.read_csv(dataset_file)
    all_runs = []

    for idx, row in data.iterrows():
        values = ast.literal_eval(row["Prices"])
        weights = ast.literal_eval(row["Weights"])
        capacity = int(row["Capacity"])
        observed_answer = float(row["Best price"])

        result = genetic_algorithm(idx + 1, values, weights, capacity, observed_answer)
        all_runs.append(result)

    df = pd.DataFrame(all_runs)
    filename = "knapsack_results_adaptive_new.xlsx"
    df.to_excel(filename, index=False)
    print(f"\nAll results written to {filename}")

# -----------------------------
# Example Run
# -----------------------------
run_all("knapsack_input.csv")
