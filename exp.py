import requests
import random
import time
from concurrent.futures import ThreadPoolExecutor

from ExperimentConfig import numberOfPortsTakenInExperiment

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
        return str(e), 0  # Return 0 delay for failed requests

# Function to make parallel requests, calculate throughput, and average delay
def parallel_requests():

    # ports taken for this experiment (just change this in ExperimentConfig.py)
    portsTakenInExperiment = ports[:numberOfPortsTakenInExperiment]

    # Number of parallel threads
    max_threads = 32  # Adjust this based on your requirements

    # Generate 500 random ports for requests
    random_ports = [random.choice(portsTakenInExperiment) for _ in range(500)]

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

    with open("results/delaysExp.txt", "a") as f:
        f.write(f"Total number of ports: {len(portsTakenInExperiment)}\n")
        f.write(f"Total Requests: {total_requests}\n")
        f.write(f"Total Time Taken: {total_time:.2f} seconds\n")
        f.write(f"Average Delay: {average_delay:.4f} seconds per request\n")
        f.write("\n\n")


if __name__ == "__main__":
    parallel_requests()
