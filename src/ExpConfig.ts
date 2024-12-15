let numberOfPortsTakenInExperiment : number = 10;

let BatchSize : number = 1;

let experimentMode : string = "Throughput"  // Change this to "Throughput" or "Delay" based on the experiment you want to run

let cmdCountForThroughput : number = 128;  // exp for batch size : multiple of LCM (1,2,4,8,16,32) = 32.

export let groupSize : number = 5;

export let t = 1;

export { numberOfPortsTakenInExperiment, BatchSize, experimentMode, cmdCountForThroughput };