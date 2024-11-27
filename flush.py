import requests

ports = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]

# make request to a port
def make_flush_request(port):
    r = requests.get(f"http://localhost:{port}/flush")
    return r.text

for port in ports:
    print(make_flush_request(port))