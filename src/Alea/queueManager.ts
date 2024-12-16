import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { exit } from "process";
import { ServerInfo } from "../serverInfo";
import { CommandBatch } from "./types";
import { getCommandBatchPrioriy, serverIdToIndex } from "./utils";

export class QueueManager{
    public N : number;
    // public f : number;
    public priorieyQueues : MinPriorityQueue<CommandBatch>[];
    public deliveredEntriesQueues : CommandBatch[][];
    public lastPriorities : number[];

    constructor(){

        this.N = ServerInfo.GROUP_SIZE;
        this.priorieyQueues = new Array(this.N);
        this.lastPriorities = new Array(this.N);

        this.deliveredEntriesQueues = new Array(this.N);

        for(let i=0; i<this.N; i++){
            this.priorieyQueues[i] = new MinPriorityQueue<CommandBatch>(getCommandBatchPrioriy);
            this.lastPriorities[i] = 0;
            this.deliveredEntriesQueues[i] = [];
        }
    }

    public insert(serverId : string, cmd : CommandBatch){
        let queueIndex = serverIdToIndex(serverId);
        this.priorieyQueues[queueIndex].push(cmd);
    }

    public hasNextPriority(serverId : string){
        // console.log(`Server id : ${serverId}`);
        let index = serverIdToIndex(serverId);
        // console.log(`index : ${index}`);
        // let front = this.priorieyQueues[index].front();
        // console.log(`Front priority : ${front?.priority}`);
        return !this.priorieyQueues[index].isEmpty() &&
            (this.priorieyQueues[index].front().priority == (this.lastPriorities[index] + 1));

    }

    public front(serverId : string){
        return this.priorieyQueues[serverIdToIndex(serverId)].front();
    }

    public dequeueAndInsertInDeliver(serverId : string){
        let rm = this.priorieyQueues[serverIdToIndex(serverId)].dequeue();
        if(rm.priority !== this.deliveredEntriesQueues[serverIdToIndex(serverId)].length + 1){
            console.error("Priority mismatch");
            exit(1);
        }
        this.deliveredEntriesQueues[serverIdToIndex(serverId)].push(rm);
    }

    public getLastPriority(serverId : string){
        return this.lastPriorities[serverIdToIndex(serverId)];
    }

    public setLastPriority(serverId : string, priority : number){
        this.lastPriorities[serverIdToIndex(serverId)] = priority;
    }

    public getDeliveredEntries(serverId : string, from : number){
        return this.deliveredEntriesQueues[serverIdToIndex(serverId)].slice(from);
    }

    public printAllQueueSize(){
        for(let i = 0; i < this.N; ++i){
            console.log(`Queue for server ${i + 1} has size ${this.priorieyQueues[i].size()} in server ${ServerInfo.OWN_ID}`);
            // this.priorieyQueues[i].forEach((v)=>{
            //     console.log(v.id);
            // });
        }
    }

    // public removeCommandBatch(cb : CommandBatch){
    //     for(let i = 0; i < this.N; ++i){
    //         this.priorieyQueues[i].remove((v)=>{
    //             return v.id === cb.id;
    //         });
    //     }
    // }
}
