import os
import re
import numpy as np

prefix = "throughputExpBt_cl_grouped_bft_16"

# Input files
files = [
    f"{prefix}_r1.txt",
    f"{prefix}_r2.txt",
    f"{prefix}_r3.txt"
]

# Dictionary to store throughput per batch size
throughput_data = {}

# Regex patterns
batch_pattern = re.compile(r"Batch size: (\d+)")
throughput_pattern = re.compile(r"Average throughput: ([\d\.]+) commands per second", re.IGNORECASE)

# Read files and store data
for file in files:
    if not os.path.exists(file):
        print(f"Warning: File {file} not found!")
        continue

    with open(file, 'r', encoding='utf-8') as f:
        content = f.readlines()

    print(f"Processing {file}, {len(content)} lines found.")
    current_batch = None
    for line in content:
        batch_match = batch_pattern.search(line)
        throughput_match = throughput_pattern.search(line)

        if batch_match:
            current_batch = int(batch_match.group(1))
        elif throughput_match and current_batch is not None:
            throughput = float(throughput_match.group(1))
            if current_batch not in throughput_data:
                throughput_data[current_batch] = []
            throughput_data[current_batch].append(throughput)

# Check if data was captured
if not throughput_data:
    print("No valid throughput data found. Please check input files and format.")
    exit()

# Calculate average throughput
avg_throughputs = {batch: np.mean(throughputs) for batch, throughputs in throughput_data.items()}

# Write to output file
output_file = f"avg_{prefix}.txt"
with open(output_file, "w", encoding='utf-8') as f:
    for batch in sorted(avg_throughputs.keys()):
        f.write(f"Batch size: {batch}\n")
        f.write(f"Average Throughput: {avg_throughputs[batch]:.6f} commands per second\n\n")

print(f"Average throughput data saved to {output_file}")
