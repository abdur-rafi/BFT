ports=(3002 3003 3004 3005
       3006 3007 3008 3009
       3010 3011 3012 3013
       3014 3015 3016 3017
       3018 3019 3020 3021
       3022 3023 3024 3025
       3026 3027 3028 3029
       3030 3031 3032 3033)

# specify the number of ports to be considered
# num_ports=$(python3 -c "import ExperimentConfig; print(ExperimentConfig.numberOfPortsTakenInExperiment)")
num_ports=$1
folder=$2



# loop through the ports array
for ((i=0; i<num_ports; i++))
do
  # copy the commands file to the container
  # docker cp bft_server_${ports[i]}:/app/commands.txt ./commandsFile/commands_${ports[i]}.txt
  mkdir -p logsGrouped/$folder/
  docker service logs bft_bft_server${ports[i]} > logsGrouped/$folder/${ports[i]}_log.txt
  wc -l logsGrouped/$folder/${ports[i]}_log.txt
done


## nested loop to check if any of the commands files are different
#for ((i=0; i<num_ports; i++))
#do
#  for ((j=0; j<num_ports; j++))
#  do
#    # check if the files are different
#    if ! cmp -s ./commandsFile/commands_${ports[i]}.txt ./commandsFile/commands_${ports[j]}.txt
#    then
#      echo "commands_${ports[i]}.txt and commands_${ports[j]}.txt are different"
#    fi
#  done
#done