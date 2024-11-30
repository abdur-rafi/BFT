let numberOfPortsTakenInExperiment : number = 8;

let BatchSize : number = 32;

let experimentMode : string = "Throughput"  // Change this to "Throughput" or "Delay" based on the experiment you want to run

let cmdCountForThroughput : number = 128;  // exp for batch size : multiple of LCM (1,2,4,8,16,32) = 32.

export { numberOfPortsTakenInExperiment, BatchSize, experimentMode, cmdCountForThroughput };