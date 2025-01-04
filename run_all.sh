# Step 1: Specify experiment parameters

# Step 2: Generate docker-compose.yml
echo "Generating docker-compose.yml file..."
python generate_docker_compose.py
if [ $? -ne 0 ]; then
    echo "Error generating docker-compose.yml. Exiting..."
    exit 1
fi

# Step 3: Create all Docker containers and command files
echo "Creating Docker containers and command files..."
chmod +x run.sh
./run.sh
if [ $? -ne 0 ]; then
    echo "Error running 'run.sh'. Exiting..."
    exit 1
fi

# Step 4: (Optional) Flush old data
echo "Flushing old data (optional)..."
python flush.py
if [ $? -ne 0 ]; then
    echo "Error running 'flush.py'. Continuing..."
fi

# Step 5: Run experiment Python script
echo "Running experiment script..."
python expDelay.py
if [ $? -ne 0 ]; then
    echo "Error running 'exp.py'. Exiting..."
    exit 1
fi

# Delay to ensure files are ready
echo "Waiting for files to be generated..."
sleep 10

# Step 6: Copy command files
echo "Copying command files..."
chmod +x cpCommandsFile.sh
./cpCommandsFile.sh
if [ $? -ne 0 ]; then
    echo "Error running 'cpCommandsFile.sh'. Exiting..."
    exit 1
fi

# Step 7: Parse command files
echo "Parsing command files..."
python expThroughput.py
if [ $? -ne 0 ]; then
    echo "Error running 'parsecmdfile.py'. Exiting..."
    exit 1
fi

echo "All steps completed successfully!"
