## Instructions to Run

- Specify parameters required for the experiment in <b>"ExperimentConfig.py" and "ExpConfig.ts"</b>
- generate docker-compose.yml file using "generate_docker_compose.py"
  ```python 
       python generate_docker_compose.py
  ```
- create all docker containers and cmd files
  ```bash 
       ./run.sh
  ```
- (Optional) 
  ```python 
       python flush.py
  ```

- Delay Calculation
  ```python  
   python expDelay.py
  ```
  
- Throughput Calculation
  -  ```bash 
         ./cpCommandsFile.sh
     ```
  - ```python 
         python expThroughput.py
    ```
  
## Or, The Whole Pipeline Together
  ** Not Recommended. As the previous step has to be done before the next steps. Sometimes, next step starts before completing the previous one. So, errors may generate
- ```bash 
       ./run_all.sh
  ```