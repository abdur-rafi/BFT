# import requests
# import random
#
# ports = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]
#
# # make request to a port
# def make_request(port):
#     r = requests.get(f"http://localhost:{port}")
#     return r.text
#
# # make 10000 requests in total to all ports randomly
# for i in range(500):
#     # port = ports[i % 4]
#     # select a port randomly
#     port = ports[random.randint(0, len(ports) - 1)]
#     # print(make_request(port))
#     make_request(port)

import requests
import random
import time
from concurrent.futures import ThreadPoolExecutor

ports = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]

# Function to make a request to a port
def make_request(port):
    try:
        r = requests.get(f"http://localhost:{port}")
        return r.text
    except requests.RequestException as e:
        return str(e)

# Function to make parallel requests
def parallel_requests():
    # Number of parallel threads
    max_threads = 16  # Adjust this based on your requirements

    # Generate 500 random ports for requests
    random_ports = [random.choice(ports) for _ in range(500)]


    # start timer
    start_time = time.time()

    # Using ThreadPoolExecutor for parallelism
    with ThreadPoolExecutor(max_threads) as executor:
        # Submit tasks to the executor
        futures = [executor.submit(make_request, port) for port in random_ports]

        # Process the results as they complete
        for future in futures:
            print(future.result())

    # end timer
    end_time = time.time()

    total_time = end_time - start_time
    total_requests = len(random_ports)
    throughput = total_requests / total_time

    print(f"Total Requests: {total_requests}")
    print(f"Total Time Taken: {total_time:.2f} seconds")
    print(f"Throughput: {throughput:.2f} requests per second")

if __name__ == "__main__":
    parallel_requests()
