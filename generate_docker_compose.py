# from ExperimentConfig import numberOfPortsTakenInExperiment
import sys
numberOfPortsTakenInExperiment = int(sys.argv[1])
batchSize = int(sys.argv[2])
totalCommands = int(sys.argv[3])
t = int(sys.argv[4])
addMalice = int(sys.argv[5])


commandsPerNode = (totalCommands // numberOfPortsTakenInExperiment)
commandsPerNode -= commandsPerNode % batchSize

print(f"N: {numberOfPortsTakenInExperiment} bs: {batchSize} tc: {totalCommands} t: {t} addMalice: {addMalice}")

output_file = "docker-compose.yml"
start_port = 3002
end_port = 3002 + numberOfPortsTakenInExperiment - 1
PORTS = ""
for port in range(start_port, end_port + 1):
    PORTS += f"{port},"



PORTS = PORTS[:-1]

with open(output_file, "w") as f:
    f.write("services:\n")
    for port in range(start_port, end_port + 1):
        index = port - start_port
        malice = True if (index < t and addMalice != 0) else False

        service = f"""
  bft_server{port}:
    image: abdurrafi403/bft_server:latest
    container_name: bft_server_{port}
    environment:
      - PORT={port}
      - ALL_PORTS={PORTS}
      - OWN_ID={port - 3001}
      - BATCH_SIZE={batchSize}
      - COMMAND_COUNT={commandsPerNode}
      - MALICIOUS={malice}
    ports:
      - "{port}:{port}"
"""
        f.write(service)

#     end = f"""
# """
#     f.write(end)