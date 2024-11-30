# number of ports taken for this experiment
numberOfPortsTakenInExperiment = 8      # Change this to the number of ports you want to take for the experiment

experimentMode = "Delay"  # Change this to "Throughput" or "Delay" based on the experiment you want to run

experimentXAxis = "BatchSize"  # Change this to "Nodes" or "BatchSize" based on the experiment you want to run

BatchSize = 32

RandomPortCountForDelay = 512   # Change this to the number of random ports which should be multiple of BatchSize

MaxThreadCountForDelay = 32

LCMForBatchSize = 64    # exp for batch size : 1,2,4,8,16,32 (2 * LCM of 1,2,4,8,16,32) = 64. Change this to the LCM of the batch sizes you want to experiment with