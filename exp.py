import requests
import random

ports = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]

# make request to a port
def make_request(port):
    r = requests.get(f"http://localhost:{port}")
    return r.text

# make 10000 requests in total to all ports randomly
for i in range(500):
    # port = ports[i % 4]
    # select a port randomly
    port = ports[random.randint(0, len(ports) - 1)]
    # print(make_request(port))
    make_request(port)