## Instructions to Run

- Specify Number of ports required for the experiment in "ExperimentConfig.py" and "ExpConfig.ts"
- if you want only delay, then comment out specific part in index.ts (comment in the file)
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

- ```python 
       python exp.py
  ```
  
- ```bash 
       ./cpCommandsFile.sh
  ```
- ```python 
       python parsecmdfile.py
  ```
  
## Or, The Whole Pipeline Together
  ** Not Recommended. As the previous step has to be done before the next steps. Sometimes, next step starts before completing the previous one. So, errors may generate
- ```bash 
       ./run_all.sh
  ```