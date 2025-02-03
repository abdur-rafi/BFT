# number of ports taken for this experiment
numberOfPortsTakenInExperiment = 16 # Change this to the number of ports you want to take for the experiment

experimentMode = "Throughput"  # Change this to "Throughput" or "Delay" based on the experiment you want to run

experimentXAxis = "BatchSize"      # Change this to "Nodes" or "BatchSize" based on the experiment you want to run

BatchSize = 128

exp_no = "r3"

if experimentXAxis == "Nodes":
    folderPath = ("F:/HISHAM_CSE  ASUS/MSc/CSE 6801/Project/Grp-BFT/BFT/logs_new/grouped_bft_16"
                  # + str(numberOfPortsTakenInExperiment)
                  + "/" + exp_no + "/")
else:
    folderPath = ("F:/HISHAM_CSE  ASUS/MSc/CSE 6801/Project/Grp-BFT/BFT/logs_new/grouped_bft_16_gs_8_bs_"
                  + str(BatchSize)
                  + "/" + exp_no + "/")

# if experimentXAxis == "Nodes":
#     folder = folderPath + "" + str(numberOfPortsTakenInExperiment)
# else:
#     folder = folderPath + "" + str(BatchSize)

expName = "grouped_bft"    # Experiment name: alea_bft or grouped_bft

grpSize = 16             # Group size (if experiment name is grouped_bft)

faultName = ""          # "" or "fault" based on the experiment you want to run

fileExtName = "_" + expName if expName == "alea_bft" else f"_{expName}_{grpSize}"

fileExtName += "_fault" if faultName == "fault" else ""

folder = folderPath

exp_mode = "plot" # Change this to "plot" or "save" based on the experiment you want to run

if exp_mode == "save":
    fileExtName += "_" + exp_no

faultPorts = [3002,3003,3010,3011,3018,3019,3026, 3027]
    # ,3004,3005,3006,3007,3008,3009]   # which ports to fault if faultName is "fault"

RandomPortCountForDelay = 512   # Change this to the number of random ports which should be multiple of BatchSize

MaxThreadCountForDelay = 32

LCMForBatchSize = 64    # exp for batch size : multiple of LCM (1,2,4,8,16,32) = 32.

VMs = ['20.244.86.92', '20.244.87.197', '20.244.47.44']  # Change this to the list of VMs you want to run the experiment on