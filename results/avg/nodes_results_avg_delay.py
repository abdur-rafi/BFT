import re
import numpy as np

prefix = "delayExp_cl_alea_bft"

# Input files
files = [
    f"{prefix}_r1.txt",
    f"{prefix}_r2.txt",
    f"{prefix}_r3.txt"
]

# Dictionary to store delays per node count
delay_data = {}

# Regex patterns
node_pattern = re.compile(r"Total number of nodes: (\d+)")
delay_pattern = re.compile(r"Average Delay: ([\d\.]+) s")

# Read files and store data
for file in files:
    with open(file, 'r') as f:
        content = f.readlines()

    current_nodes = None
    for line in content:
        node_match = node_pattern.search(line)
        delay_match = delay_pattern.search(line)

        if node_match:
            current_nodes = int(node_match.group(1))
        elif delay_match and current_nodes is not None:
            delay = float(delay_match.group(1))
            if current_nodes not in delay_data:
                delay_data[current_nodes] = []
            delay_data[current_nodes].append(delay)

# Calculate average delays
avg_delays = {nodes: np.mean(delays) for nodes, delays in delay_data.items()}

# Write to output file
output_file = f"avg_{prefix}.txt"
with open(output_file, "w") as f:
    for nodes in sorted(avg_delays.keys()):
        f.write(f"Total number of nodes: {nodes}\n")
        f.write(f"Average Delay: {avg_delays[nodes]:.6f} s\n\n")

print(f"Average delay data saved to {output_file}")