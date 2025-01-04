from ExperimentConfig import (numberOfPortsTakenInExperiment, experimentXAxis, BatchSize, fileExtName,
                              folderPath, faultPorts, faultName)
import re

folder = folderPath + "" + str(numberOfPortsTakenInExperiment)

ports = [3002, 3003, 3004, 3005,
         3006, 3007, 3008, 3009,
         3010, 3011, 3012, 3013,
         3014, 3015, 3016, 3017,
         3018, 3019, 3020, 3021,
         3022, 3023, 3024, 3025,
         3026, 3027, 3028, 3029,
         3030, 3031, 3032, 3033,]

def get_first_and_last_relevant_lines(file):
    with open(file, 'r') as f:
        lines = f.readlines()

        first_timestamp = None
        last_timestamp = None
        relevant_lines_count = 0

        for line in lines:
            # Match lines containing 'command:' but NOT 'Executing'
            if "command:" in line and "Executing" not in line:
                # Extract the timestamp (last long number in the line)
                match = re.search(r'command: .* (\d+)', line)
                if match:
                    timestamp = int(match.group(1))
                    relevant_lines_count += 1

                    if first_timestamp is None:
                        first_timestamp = timestamp  # Set the first timestamp
                    last_timestamp = timestamp  # Continuously update the last timestamp

        print(f"First timestamp: {first_timestamp}, Last timestamp: {last_timestamp}, Relevant lines count: {relevant_lines_count}")
        return first_timestamp, last_timestamp, relevant_lines_count

def main():
    throughputs = []

    relevant_ports = ports[:numberOfPortsTakenInExperiment]

    # Consider only the ports that are not faulty
    if faultName == "fault":
        good_ports = [port for port in relevant_ports if port not in faultPorts]
        relevant_ports = good_ports

    for port in relevant_ports:
        filename = f"{folder}/{port}_log.txt"
        first, last, cmdCount = get_first_and_last_relevant_lines(filename)
        first = int(first)
        last = int(last)
        cmdCount = int(cmdCount)

        delta = (last - first) / 1000
        throughput = (cmdCount - 1) / delta
        throughputs.append(throughput)

    avgThroughput = sum(throughputs) / len(throughputs)
    print(f"Average throughput: {avgThroughput} commands per second")

    if experimentXAxis == "Nodes":
        with open("results/throughputExp_cl" + fileExtName + ".txt", "a") as f:
            f.write(f"Total number of nodes: {numberOfPortsTakenInExperiment}\n")
            f.write(f"Average throughput: {avgThroughput} commands per second\n")
            f.write("\n\n")

    elif experimentXAxis == "BatchSize":
        with open("results/throughputExpBt_cl" + fileExtName + ".txt", "a") as f:
            f.write(f"Batch size: {BatchSize}\n")
            f.write(f"Average throughput: {avgThroughput} commands per second\n")
            f.write("\n\n")


if __name__ == "__main__":
    main()