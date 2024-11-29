import matplotlib.pyplot as plt
import re

# Function to parse the text file for Delay vs Nodes data
def parse_delay_file(filePath):
    numberOfNodes = []
    expDelays = []

    # Open and read the file
    with open(filePath, 'r') as file:
        for line in file:
            # Extract "Total number of nodes" values
            if "Total number of nodes" in line:
                numberOfNodes.append(int(re.search(r'\d+', line).group()))
            # Extract "Average Delay" values
            elif "Average Delay" in line:
                expDelays.append(float(re.search(r'\d+\.\d+', line).group()))

    return numberOfNodes, expDelays

# File path for the delay experiment data
file_path = 'results/delaysExp.txt'  # Correct file path from uploaded file

# Parse the file
nodes, delays = parse_delay_file(file_path)

# Plotting the graph
plt.figure(figsize=(10, 6))
plt.plot(nodes, delays, marker='o', linestyle='-', color='r', label='Delay')

# Adding text annotations for (x, y) coordinates
for x, y in zip(nodes, delays):
    plt.text(x, y, f'({x}, {y:.4f})', fontsize=10, ha='right', va='bottom', color='black')

# Labels and title
plt.xlabel('Number of Nodes', fontsize=14)
plt.ylabel('Average Delay (seconds per request)', fontsize=14)
plt.title('Delay vs Number of Nodes', fontsize=16)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend(fontsize=12)

# Save the plot as an image file
plt.savefig("results/delay_vs_nodes.png", format='png', dpi=300)

# Show the plot
plt.show()