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
    max_threads = 8  # Adjust this based on your requirements

    # start timer
    start = time.time()

    # Using ThreadPoolExecutor for parallelism
    with ThreadPoolExecutor(max_threads) as executor:
        # Generate 500 random ports for requests
        random_ports = [random.choice(ports) for _ in range(500)]
        # Submit tasks to the executor
        futures = [executor.submit(make_request, port) for port in random_ports]

        # Process the results as they complete
        for future in futures:
            print(future.result())

    # end timer
    end = time.time()

    print(f"Time taken: {end - start} seconds for {len(random_ports)} requests")

if __name__ == "__main__":
    parallel_requests()
