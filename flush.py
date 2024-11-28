import requests

from ExperimentConfig import numberOfPortsTakenInExperiment

ports = [3002, 3003, 3004, 3005,
         3006, 3007, 3008, 3009,
         3010, 3011, 3012, 3013,
         3014, 3015, 3016, 3017,
         3018, 3019, 3020, 3021,
         3022, 3023, 3024, 3025,
         3026, 3027, 3028, 3029,
         3030, 3031, 3032, 3033]

# make request to a port
def make_flush_request(port):
    r = requests.get(f"http://localhost:{port}/flush")
    return r.text

# ports taken for this experiment
portsTakenInExperiment = ports[:numberOfPortsTakenInExperiment]

for port in portsTakenInExperiment:
    print(make_flush_request(port))