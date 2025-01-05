#!/bin/bash

VM_NO=$1
# SSH into the VM and run the commands
ssh -o StrictHostKeyChecking=no arafi@pc$VM_NO.emulab.net << EOF
  # Update and install Docker
  # sudo apt update
  # sudo apt install -y docker.io
  
  # Start and enable Docker service
  # sudo systemctl start docker
  # sudo systemctl enable docker
  
  # Install Docker Compose
  #sudo curl -L "https://github.com/docker/compose/releases/download/v2.26.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
  #sudo chmod +x /usr/local/bin/docker-compose
  
  # Set permissions for Docker socket
  # sudo chmod 666 /var/run/docker.sock
  
  
  # Join the Docker Swarm (with token)
  # sudo docker swarm join --advertise-addr $VM_IP --token SWMTKN-1-3sq0xaqct1tpn6r245x22201y40pnfxt6bnp8s73q9wly2nm7r-4575kb7nothl1zo2l2vqg535u 20.244.86.92:2377
  sudo docker swarm leave
  sudo docker swarm join --token SWMTKN-1-0n0283p7nttkcxmnv4qcdw8vt1wcunznhi8n8tnm6u408szdz4-3apoqj7o8x31qe5ezyfgg8o8m 10.10.1.1:2377
EOF

echo "Commands executed on the VM."

# docker swarm init --advertise-addr 10.10.1.1
