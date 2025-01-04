# number of ports taken for this experiment
numberOfPortsTakenInExperiment = 32      # Change this to the number of ports you want to take for the experiment

experimentMode = "Delay"  # Change this to "Throughput" or "Delay" based on the experiment you want to run

experimentXAxis = "Nodes"  # Change this to "Nodes" or "BatchSize" based on the experiment you want to run

BatchSize = 1

expName = "alea_bft"    # Experiment name: alea_bft or grouped_bft

grpSize = 4             # Group size (if experiment name is grouped_bft)

fileExtName = "_" + expName if expName == "alea_bft" else f"_{expName}_{grpSize}"

RandomPortCountForDelay = 512   # Change this to the number of random ports which should be multiple of BatchSize

MaxThreadCountForDelay = 32

LCMForBatchSize = 64    # exp for batch size : multiple of LCM (1,2,4,8,16,32) = 32.

VMs = ['20.244.86.92', '20.244.87.197', '20.244.47.44']  # Change this to the list of VMs you want to run the experiment on