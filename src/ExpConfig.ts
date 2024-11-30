let numberOfPortsTakenInExperiment : number = 8;

let BatchSize : number = 32;

let experimentMode : string = "Delay"  // Change this to "Throughput" or "Delay" based on the experiment you want to run

let cmdCountForThroughput : number = 252; // Number of commands to be sent for throughput calculation (should be a multiple of BatchSize)

export { numberOfPortsTakenInExperiment, BatchSize, experimentMode, cmdCountForThroughput };