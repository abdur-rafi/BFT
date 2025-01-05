#!/bin/bash

# VM connection details
VM_USER="azureuser"
VM_IP="4.240.98.63"
keyFile=/home/abdur-rafi/.ssh/bft-16_key.pem

chmod 400 $keyFile

# SSH into the VM and run the commands
ssh -i $keyFile -o StrictHostKeyChecking=no "$VM_USER@$VM_IP" << EOF
  # Update and install Docker
  sudo apt update
  sudo apt install -y docker.io
  
  # Start and enable Docker service
  sudo systemctl start docker
  sudo systemctl enable docker
  
  # Install Docker Compose
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.26.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  
  # Set permissions for Docker socket
  sudo chmod 666 /var/run/docker.sock
  
  
  # Join the Docker Swarm (with token)
  # sudo docker swarm join --advertise-addr $VM_IP --token SWMTKN-1-3sq0xaqct1tpn6r245x22201y40pnfxt6bnp8s73q9wly2nm7r-4575kb7nothl1zo2l2vqg535u 20.244.86.92:2377
EOF

echo "Commands executed on the VM."

