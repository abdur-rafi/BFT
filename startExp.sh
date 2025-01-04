#!/bin/bash

# Check if all arguments are provided
if [ $# -ne 5 ]; then
    echo "Error: Missing arguments."
    echo "Usage: $0 <N> <batchSize> <totalComm> <groupSize> <faultTolerance>"
    exit 1
fi

N=$1
batchSize=$2
totalComm=$3
gs=$4
t=$5

echo "N: $N batchsize: $batchSize TotalComm: $totalComm groupSize: $gs faultTolerance: $t"

# Generate docker-compose file
python3 generate_docker_compose.py $N $batchSize $totalComm $gs $t

# Deploy the stack
docker stack deploy --compose-file docker-compose.yml --resolve-image always bft

# Display the stack status
docker stack ps bft

docker service logs -f bft_bft_server3005
