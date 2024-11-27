import requests
import random
import time
from concurrent.futures import ThreadPoolExecutor

ports = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]

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
    # Number of parallel threads
    max_threads = 32  # Adjust this based on your requirements

    # Generate 500 random ports for requests
    random_ports = [random.choice(ports) for _ in range(500)]

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
#     throughput = total_requests / total_time

    # Calculate average delay
    average_delay = sum(delays) / len(delays) if delays else 0

    print(f"Total Requests: {total_requests}")
    print(f"Total Time Taken: {total_time:.2f} seconds")
#     print(f"Throughput: {throughput:.2f} requests per second")
    print(f"Average Delay: {average_delay:.4f} seconds per request")

if __name__ == "__main__":
    parallel_requests()
