import matplotlib.pyplot as plt
import re

# Function to parse the text file
def parse_throughput_file(filePath):
    numberOfNodes = []
    thrput = []

    # Open and read the file
    with open(filePath, 'r') as file:
        for line in file:
            # Extract "Total number of nodes" values
            if "Total number of nodes" in line:
                numberOfNodes.append(int(re.search(r'\d+', line).group()))
            # Extract "Average throughput" values
            elif "Average throughput" in line:
                thrput.append(float(re.search(r'\d+\.\d+', line).group()))

    return numberOfNodes, thrput

# File path
file_path = 'results/throughputExp.txt'

# Parse the file
nodes, throughput = parse_throughput_file(file_path)

# Plotting the graph
plt.figure(figsize=(10, 6))
plt.plot(nodes, throughput, marker='o', linestyle='-', color='b', label='Throughput')

# Adding text annotations for (x, y) coordinates
for x, y in zip(nodes, throughput):
    plt.text(x, y, f'({x}, {y:.2f})', fontsize=10, ha='right', va='bottom', color='black')

# Labels and title
plt.xlabel('Number of Nodes', fontsize=14)
plt.ylabel('Throughput (commands per second)', fontsize=14)
plt.title('Throughput vs Number of Nodes', fontsize=16)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend(fontsize=12)

# Save the plot as an image file
plt.savefig("results/throughput_vs_nodes.png", format='png', dpi=300)

# Show the plot
plt.show()
