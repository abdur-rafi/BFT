import re
from collections import defaultdict
from ExperimentConfig import (numberOfPortsTakenInExperiment, experimentXAxis, BatchSize,
                              fileExtName, faultPorts, faultName, folder)

def calculate_average_delay(folder, ports):
    """
    Calculates the average delay for the first 1000 commands by considering issued and all executed timestamps across multiple files.

    :param folder: Path to the folder containing log files.
    :param ports: List of port numbers to process.
    :return: Overall average delay (in milliseconds).
    """
    # Dictionary to store all timestamps for commands
    command_timestamps = defaultdict(lambda: {"issued": None, "executed": []})  # {"command": {"issued": timestamp, "executed": [timestamps]}}

    # Process all log files
    for port in ports:
        filename = f"{folder}/{port}_log.txt"
        with open(filename, 'r') as f:
            lines = f.readlines()
            for line in lines:
                # Match `command:` lines that do NOT contain "Executing" (for issued timestamp)
                if "command:" in line and "Executing" not in line:
                    command_match = re.search(r'command: ([\d_]+) (\d+)', line)
                    if command_match:
                        command = command_match.group(1)  # e.g., "1_0"
                        # Only consider the first 1000 commands (e.g., "1_0" to "1_999")
                        node_id, command_number = map(int, command.split("_"))
                        if command_number < 1000:  # Ensure it's within the first 1000 commands
                            issued_timestamp = int(command_match.group(2))  # Issued timestamp
                            if command_timestamps[command]["issued"] is None:
                                command_timestamps[command]["issued"] = issued_timestamp

                # Match `Executing` lines (for executed timestamps)
                elif "Executing" in line:
                    executing_match = re.search(r'Executing \d+th command: ([\d_]+) (\d+)', line)
                    if executing_match:
                        command = executing_match.group(1)  # e.g., "1_0"
                        # Only consider the first 1000 commands (e.g., "1_0" to "1_999")
                        node_id, command_number = map(int, command.split("_"))
                        if command_number < 1000:  # Ensure it's within the first 1000 commands
                            executed_timestamp = int(executing_match.group(2))  # Executed timestamp
                            command_timestamps[command]["executed"].append(executed_timestamp)

    # Calculate delays
    delays = []
    for command, timestamps in command_timestamps.items():
        issued_timestamp = timestamps["issued"]
        executed_timestamps = timestamps["executed"]

        if issued_timestamp is not None and executed_timestamps:
            # Calculate the delay for all executed timestamps for this command
            command_delays = [executed - issued_timestamp for executed in executed_timestamps]

            # # Take the average delay for this command
            # avg_command_delay = sum(command_delays) / len(command_delays)

            # Take the maximum delay for this command
            avg_command_delay = max(command_delays)
            delays.append(avg_command_delay)

    # Calculate the overall average delay
    if delays:
        overall_avg_delay = sum(delays) / len(delays)
        return overall_avg_delay
    else:
        return None


def main():

    ports = [3002, 3003, 3004, 3005,
             3006, 3007, 3008, 3009,
             3010, 3011, 3012, 3013,
             3014, 3015, 3016, 3017,
             3018, 3019, 3020, 3021,
             3022, 3023, 3024, 3025,
             3026, 3027, 3028, 3029,
             3030, 3031, 3032, 3033,]

    # Consider only the ports used in the experiment
    relevant_ports = ports[:numberOfPortsTakenInExperiment]

    # Consider only the ports that are not faulty
    if faultName == "fault":
        good_ports = [port for port in relevant_ports if port not in faultPorts]
        relevant_ports = good_ports

    overall_avg_delay = calculate_average_delay(folder, relevant_ports)

    # Print and save the result
    if overall_avg_delay is not None:
        print(f"Overall Average Delay: {overall_avg_delay / 1000} s")  # Convert to seconds

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
