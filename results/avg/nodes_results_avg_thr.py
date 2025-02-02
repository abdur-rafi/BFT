import re
import numpy as np

prefix = "throughputExp_cl_grouped_bft_16"

# Input files
files = [
    f"{prefix}_r1.txt",
    f"{prefix}_r2.txt",
    f"{prefix}_r3.txt"
]

# Dictionary to store throughput per node count
throughput_data = {}

# Regex patterns
node_pattern = re.compile(r"Total number of nodes: (\d+)")
throughput_pattern = re.compile(r"Average throughput: ([\d\.]+) commands per second")

# Read files and store data
for file in files:
    with open(file, 'r') as f:
        content = f.readlines()

    current_nodes = None
    for line in content:
        node_match = node_pattern.search(line)
        throughput_match = throughput_pattern.search(line)

        if node_match:
            current_nodes = int(node_match.group(1))
        elif throughput_match and current_nodes is not None:
            throughput = float(throughput_match.group(1))
            if current_nodes not in throughput_data:
                throughput_data[current_nodes] = []
            throughput_data[current_nodes].append(throughput)

# Calculate average throughput
avg_throughputs = {nodes: np.mean(throughputs) for nodes, throughputs in throughput_data.items()}

# Write to output file
output_file = f"avg_{prefix}.txt"
with open(output_file, "w") as f:
    for nodes in sorted(avg_throughputs.keys()):
        f.write(f"Total number of nodes: {nodes}\n")
        f.write(f"Average Throughput: {avg_throughputs[nodes]:.6f} commands per second\n\n")

print(f"Average throughput data saved to {output_file}")
