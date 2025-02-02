import re
import numpy as np

prefix = "delayExpBt_cl_alea_bft"

# Input files
files = [
    f"{prefix}_r1.txt",
    f"{prefix}_r2.txt",
    f"{prefix}_r3.txt"
]

# Dictionary to store delay per batch size
delay_data = {}

# Regex patterns
batch_pattern = re.compile(r"Batch size: (\d+)")
delay_pattern = re.compile(r"Average Delay: ([\d\.]+) s")

# Read files and store data
for file in files:
    with open(file, 'r') as f:
        content = f.readlines()

    current_batch = None
    for line in content:
        batch_match = batch_pattern.search(line)
        delay_match = delay_pattern.search(line)

        if batch_match:
            current_batch = int(batch_match.group(1))
        elif delay_match and current_batch is not None:
            delay = float(delay_match.group(1))
            if current_batch not in delay_data:
                delay_data[current_batch] = []
            delay_data[current_batch].append(delay)

# Calculate average delays
avg_delays = {batch: np.mean(delays) for batch, delays in delay_data.items()}

# Write to output file
output_file = f"avg_{prefix}.txt"
with open(output_file, "w") as f:
    for batch in sorted(avg_delays.keys()):
        f.write(f"Batch size: {batch}\n")
        f.write(f"Average Delay: {avg_delays[batch]:.6f} s\n\n")

print(f"Average delay data saved to {output_file}")
