docker-compose down
docker build -t bft_server .
docker-compose up 

# create CommandsFile directory with all 32 commands files
# ports=(3002 3003 3004 3005
#        3006 3007 3008 3009
#        3010 3011 3012 3013
#        3014 3015 3016 3017
#        3018 3019 3020 3021
#        3022 3023 3024 3025
#        3026 3027 3028 3029
#        3030 3031 3032 3033)

# # specify the number of ports to be considered
# num_ports=$(python -c "import ExperimentConfig; print(ExperimentConfig.numberOfPortsTakenInExperiment)")

# # create empty commands files for each port
# for ((i=0; i<num_ports; i++))
# do
#   touch ./commandsFile/commands_${ports[i]}.txt
# done
