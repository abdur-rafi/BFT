import random
import time
from concurrent.futures import ThreadPoolExecutor

import requests

from ExperimentConfig import numberOfPortsTakenInExperiment, experimentXAxis, BatchSize, RandomPortCountForDelay, \
    MaxThreadCountForDelay, LCMForBatchSize

ports = [3002, 3003, 3004, 3005,
         3006, 3007, 3008, 3009,
         3010, 3011, 3012, 3013,
         3014, 3015, 3016, 3017,
         3018, 3019, 3020, 3021,
         3022, 3023, 3024, 3025,
         3026, 3027, 3028, 3029,
         3030, 3031, 3032, 3033,]

# Function to make a request to a port and measure its delay
def make_request(port):
    try:
        start = time.time()
        r = requests.get(f"http://localhost:{port}")
        end = time.time()
        delay = end - start  # Calculate the delay for this request
        return r.text, delay
    except requests.RequestException as e:
        print(f"Request to port {port} failed: {e}")
        return None, 0

# Function to make parallel requests, calculate throughput, and average delay
def parallel_requests():

    # ports taken for this experiment (just change this in ExperimentConfig.py)
    portsTakenInExperiment = ports[:numberOfPortsTakenInExperiment]

    # Number of parallel threads
    max_threads = MaxThreadCountForDelay  # Adjust this based on your requirements

    random_ports = []

    if experimentXAxis == "Nodes":
        # Randomly generate `RandomPortCountForDelay` requests
        random_ports = [random.choice(portsTakenInExperiment) for _ in range(RandomPortCountForDelay)]
    elif experimentXAxis == "BatchSize":
        # Generate requests ensuring each port gets a multiple of the batch size
        for port in portsTakenInExperiment:
            # Assign requests in multiples of batch size
            random_ports.extend([port] * LCMForBatchSize)

        # # Randomly shuffle the ports
        # random.shuffle(random_ports)

    # Start the timer
    start_time = time.time()

    # Using ThreadPoolExecutor for parallelism
    delays = []  # To store delays of all requests
    with ThreadPoolExecutor(max_threads) as executor:
        # Submit tasks to the executor
        futures = [executor.submit(make_request, port) for port in random_ports]

        # Wait for all tasks to complete and collect results
        for future in futures:
            _, delay = future.result()
            delays.append(delay)

    # End the timer
    end_time = time.time()

    # Calculate throughput
    total_time = end_time - start_time
    total_requests = len(random_ports)

    # Calculate average delay
    average_delay = sum(delays) / len(delays) if delays else 0

    print(f"Total Requests: {total_requests}")
    print(f"Total Time Taken: {total_time:.2f} seconds")
    print(f"Average Delay: {average_delay:.4f} seconds per request")

    if experimentXAxis == "Nodes":
        with open("results/delaysExp.txt", "a") as f:
            f.write(f"Total number of nodes: {len(portsTakenInExperiment)}\n")
            f.write(f"Total Requests: {total_requests}\n")
            f.write(f"Total Time Taken: {total_time:.2f} seconds\n")
            f.write(f"Average Delay: {average_delay:.4f} seconds per request\n")
            f.write("\n\n")

    elif experimentXAxis == "BatchSize":
        with open("results/delaysExpBt.txt", "a") as f:
            f.write(f"Batch size: {BatchSize}\n")
            f.write(f"Average Delay: {average_delay:.4f} seconds per request\n")
            f.write("\n\n")


if __name__ == "__main__":
    parallel_requests()
