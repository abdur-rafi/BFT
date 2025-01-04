import re
from collections import defaultdict

from ExperimentConfig import numberOfPortsTakenInExperiment, experimentXAxis, BatchSize, fileExtName

def calculate_average_delay(file):
    # Dictionary to store command timestamps
    command_timestamps = defaultdict(dict)  # Structure: {command: {"issued": timestamp, "executed": timestamp}}
    delays = []

    with open(file, 'r') as f:
        lines = f.readlines()

        for line in lines:
            # Match `command:` lines that do NOT contain "Executing"
            if "command:" in line and "Executing" not in line:
                command_match = re.search(r'command: ([\d_]+) (\d+)', line)
                if command_match:
                    command = command_match.group(1)  # e.g., "1_0"
                    issued_timestamp = int(command_match.group(2))  # Timestamp of the command issuance
                    command_timestamps[command]["issued"] = issued_timestamp

            # Match `Executing` lines
            elif "Executing" in line:
                executing_match = re.search(r'Executing \d+th command: ([\d_]+) (\d+)', line)
                if executing_match:
                    command = executing_match.group(1)  # e.g., "1_0"
                    executed_timestamp = int(executing_match.group(2))  # Timestamp of the command execution
                    command_timestamps[command]["executed"] = executed_timestamp

    # print(command_timestamps["1_0"])
    # print(command_timestamps["1_100"])
    # print(command_timestamps["1_200"])

    # Calculate delays for all commands
    for command, timestamps in command_timestamps.items():
        if "issued" in timestamps and "executed" in timestamps:
            delay = timestamps["executed"] - timestamps["issued"]
            delays.append(delay)

    # Calculate the average delay
    if delays:
        avg_delay = sum(delays) / len(delays)
        return avg_delay
    else:
        return None


def main():
    folder = "F:/HISHAM_CSE  ASUS/MSc/CSE 6801/Project/BFT/logsCloudLab/" + str(numberOfPortsTakenInExperiment)

    ports = [3002, 3003, 3004, 3005,
             3006, 3007, 3008, 3009,
             3010, 3011, 3012, 3013,
             3014, 3015, 3016, 3017,
             3018, 3019, 3020, 3021,
             3022, 3023, 3024, 3025,
             3026, 3027, 3028, 3029,
             3030, 3031, 3032, 3033,]

    all_delays = []

    for port in ports[:numberOfPortsTakenInExperiment]:
        filename = f"{folder}/{port}_log.txt"
        avg_delay = calculate_average_delay(filename)
        if avg_delay is not None:
            all_delays.append(avg_delay)

    # Overall average delay across all ports
    if all_delays:
        overall_avg_delay = sum(all_delays) / len(all_delays)
        print(f"Overall Average Delay: {overall_avg_delay / 1000} s")

        if experimentXAxis == "Nodes":
            with open("results/delayExp_cl" + fileExtName + ".txt", "a") as f:
                f.write(f"Total number of nodes: {numberOfPortsTakenInExperiment}\n")
                f.write(f"Average Delay: {overall_avg_delay / 1000} s\n")
                f.write("\n\n")

        elif experimentXAxis == "BatchSize":
            with open("results/delayExpBt_cl" + fileExtName + ".txt", "a") as f:
                f.write(f"Batch size: {BatchSize}\n")
                f.write(f"Average Delay: {overall_avg_delay / 1000} s\n")
                f.write("\n\n")
    else:
        print("No delays calculated. Please check the logs.")


if __name__ == "__main__":
    main()
