# number of ports taken for this experiment
numberOfPortsTakenInExperiment = 32      # Change this to the number of ports you want to take for the experiment

experimentMode = "Delay"  # Change this to "Throughput" or "Delay" based on the experiment you want to run

experimentXAxis = "Nodes"      # Change this to "Nodes" or "BatchSize" based on the experiment you want to run

BatchSize = 1

folderPath = "F:/HISHAM_CSE  ASUS/MSc/CSE 6801/Project/Grp-BFT/BFT/logsGrouped8Malice/"

expName = "grouped_bft"    # Experiment name: alea_bft or grouped_bft

grpSize = 8             # Group size (if experiment name is grouped_bft)

faultName = "fault"          # "" or "fault" based on the experiment you want to run

fileExtName = "_" + expName if expName == "alea_bft" else f"_{expName}_{grpSize}"

fileExtName += "_fault" if faultName == "fault" else ""

faultPorts = [3002,3003,3010,3011,3018,3019,3026,3027]   # which ports to fault if faultName is "fault"

RandomPortCountForDelay = 512   # Change this to the number of random ports which should be multiple of BatchSize

MaxThreadCountForDelay = 32

LCMForBatchSize = 64    # exp for batch size : multiple of LCM (1,2,4,8,16,32) = 32.

VMs = ['20.244.86.92', '20.244.87.197', '20.244.47.44']  # Change this to the list of VMs you want to run the experiment on