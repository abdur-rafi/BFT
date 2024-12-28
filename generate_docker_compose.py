from ExperimentConfig import numberOfPortsTakenInExperiment

output_file = "docker-compose.yml"
start_port = 3002
end_port = 3002 + numberOfPortsTakenInExperiment - 1

with open(output_file, "w") as f:
    f.write("services:\n")
    for port in range(start_port, end_port + 1):
        service = f"""
  bft_server{port}:
    image: bft_server
    container_name: bft_server_{port}
    environment:
      - PORT={port}
      - ALL_PORTS=${{PORTS}}
      - OWN_ID={port - 3001}
      - FAIL=false
      - MALICIOUS=false
    ports:
      - "{port}:{port}"
"""
        f.write(service)
