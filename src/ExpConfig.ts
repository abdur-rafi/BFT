import { ServerInfo } from "./serverInfo";

let numberOfPortsTakenInExperiment : number = ServerInfo.N;

let BatchSize : number = ServerInfo.BatchSize;

let experimentMode : string = "Throughput"  // Change this to "Throughput" or "Delay" based on the experiment you want to run

let cmdCountForThroughput : number = ServerInfo.commandCount;  // exp for batch size : multiple of LCM (1,2,4,8,16,32) = 32.

export { numberOfPortsTakenInExperiment, BatchSize, experimentMode, cmdCountForThroughput };