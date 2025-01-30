#!/bin/bash

# Check if all arguments are provided
if [ $# -ne 5 ]; then
    echo "Error: Missing arguments."
    echo "Usage: $0 <N> <batchSize> <totalComm> <t> <malice>"
    exit 1
fi

N=$1
batchSize=$2
totalComm=$3
t=$4
malice=$5

echo "N: $N batchsize: $batchSize TotalComm: $totalComm t: $t malice: $malice"

# Generate docker-compose file
python3 generate_docker_compose.py $N $batchSize $totalComm $t $malice

# Deploy the stack
docker stack deploy --compose-file docker-compose.yml --resolve-image always bft

# Display the stack status
docker stack ps bft

# docker service logs -f bft_bft_server3009
