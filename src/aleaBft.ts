import { IGetCompareValue, MinPriorityQueue } from "@datastructures-js/priority-queue";
import { ServerInfo } from "./serverInfo";
import { ABAStore } from "./ABA";
import { VCBCStore } from "./VCBC/VCBCStore";
import { io } from ".";
import { VCBC } from "./VCBC/VCBCParty";
import { exit } from "process";
import fs from 'fs';

export const AgreementComponentMessageType = {
    FILL_GAP : "FILL_GAP",
    FILLER : "FILLER",
}

export type FILL_GAP_MESSAGE = {
    requestedFor : string;
    lastPriority : number;
    requestedBy : string;
    roundNo : number;
}


export type FILLER_MESSAGE = {
    sentFrom : string;
    requestedFor : string;
    requestedBy : string;
    commandBatches : CommandBatch[]
}


export type ClientCommand = {
    id : string;
    command : string;
}

export type CommandBatch = {
    id : string;
    priority : number;
    commands : ClientCommand[];
    createdFrom : string;
}

const getCommandBatchPrioriy : IGetCompareValue<CommandBatch> = (commandBatch : CommandBatch) => {
    return commandBatch.priority;
}

function serverIdToIndex(id : string){
    return parseInt(id) - 1;
}

class BroadCastComponent{
    public batchSize : number;
    public priority : number;
    public ownIndex : number;
    public batch : ClientCommand[];

    constructor(){
        this.batchSize = 32;
        this.priority = 0;
        this.ownIndex = serverIdToIndex(ServerInfo.OWN_ID);
        this.batch = [];
    }

    public onReceiveNotExecutedCommand(command : ClientCommand){
        this.batch.push(command);
        if(this.batch.length === this.batchSize){
            this.priority++;
            let batch : CommandBatch = {
                id : VCBC.getTag(ServerInfo.OWN_ID, this.priority),
                priority : this.priority,
                commands : this.batch,
                createdFrom : ServerInfo.OWN_ID
            }
            // todo
            VCBCStore.startVCBC(batch.id, batch);
            this.batch = [];
        }
    }
}

class QueueManager{
    public N : number;
    // public f : number;
    public priorieyQueues : MinPriorityQueue<CommandBatch>[];
    public deliveredEntriesQueues : CommandBatch[][];
    public lastPriorities : number[];

    constructor(){

        this.N = ServerInfo.N
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
        let index = serverIdToIndex(serverId);
        // console.log(`index : ${index}`);
        // let front = this.priorieyQueues[index].front();
        // console.log(`Front priority : ${front?.priority}`);
        return (this.priorieyQueues[index].isEmpty() === false) && 
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

class ExecuteCommand{
    public executedCommands : Set<string>;
    public file : number;
    constructor(){
        this.executedCommands = new Set();
        // open a file to write
        this.file = fs.openSync('commands.txt', 'w');
    }
    
    public isExecuted(m : CommandBatch['commands'][0]){
        return this.executedCommands.has(m.id);
    }

    public executeIfNotAlready(m : CommandBatch['commands'][0]){
        if(!this.executedCommands.has(m.id)){
            // console.log(`Executing command with id ${m.id} in server ${ServerInfo.OWN_ID}`);
            // write to file
            fs.writeSync(this.file, `Executing command ${m.id}\n`);
        }
    }
}

class AgreementComponent{
    public roundNo : number;
    public qManager : QueueManager;
    public excmd : ExecuteCommand;
    public waiting : boolean;
    public waitingForServerId : string;
    public waitingPriority : number;
    
    constructor(qm : QueueManager, excm : ExecuteCommand){
        this.roundNo = 0;
        this.qManager = qm;
        this.excmd = excm;
        this.waiting = false;
        this.waitingForServerId = '';
        this.waitingPriority = 0;
    }

    public roundNoToServer(){
        return ServerInfo.ALL_IDS[this.roundNo % ServerInfo.N];
    }

    public startAgreementComponent(){
        this.roundNo++;
        let serverId = this.roundNoToServer();
        let propose : boolean = this.qManager.hasNextPriority(serverId);
        // console.log(`Starting ABA for round ${this.roundNo} in server ${ServerInfo.OWN_ID}`);
        ABAStore.ABA_Start(propose, `${this.roundNo}`, (v)=>{
            // console.log(`ABA decided ${v} for round ${this.roundNo} in server ${ServerInfo.OWN_ID} to execute command of server ${serverId}`);
            if(v){
                this.onTrueDeliver(serverId);
            }
            else{
                this.startAgreementComponent();
            }
        });
    }

    public onTrueDeliver(serverId : string){
        if(this.qManager.hasNextPriority(serverId)){
            let cmd = this.qManager.front(serverId);
            this.onAcDeliver(cmd);
            this.qManager.dequeueAndInsertInDeliver(serverId);
            this.qManager.setLastPriority(serverId, cmd.priority);
            this.startAgreementComponent();
        }
        else{
            let message : FILL_GAP_MESSAGE = {
                lastPriority : this.qManager.getLastPriority(serverId),
                requestedFor : serverId,
                requestedBy : ServerInfo.OWN_ID,
                roundNo : this.roundNo,
            }
            io.emit(AgreementComponentMessageType.FILL_GAP, message);
            this.waiting = true;
            this.waitingForServerId = serverId;
            this.waitingPriority = this.qManager.getLastPriority(serverId) + 1;
            console.log(`No next priority for server ${serverId}`);
            console.log(`Waiting for server ${serverId} to fill gap`);
            this.qManager.printAllQueueSize();
        }
    }

    public onAcDeliver(m : CommandBatch){
        m.commands.forEach(c=>{
            this.excmd.executeIfNotAlready(c);
        })
    }

    public onFillGap(message : FILL_GAP_MESSAGE){
        if(this.qManager.getLastPriority(message.requestedFor) > message.lastPriority){
            let cmds = this.qManager.getDeliveredEntries(message.requestedFor, message.lastPriority);
            let msg : FILLER_MESSAGE = {
                commandBatches : cmds,
                sentFrom : ServerInfo.OWN_ID,
                requestedFor : message.requestedFor,
                requestedBy : message.requestedBy
            }
            ServerInfo.PEER_CONNECTIONS[message.requestedBy].emit(AgreementComponentMessageType.FILLER, msg);
        }
    }

}

export class AleaBft{
    public brComponent : BroadCastComponent;
    public qManager : QueueManager;
    public exComm : ExecuteCommand;
    public acComponent : AgreementComponent

    constructor(){
        this.qManager = new QueueManager();
        this.exComm = new ExecuteCommand();
        this.acComponent = new AgreementComponent(this.qManager, this.exComm);
        this.brComponent = new BroadCastComponent();


        VCBCStore.onDecide = (cmdb)=>{
            console.log(`Decided command batch with id ${cmdb.id} in server ${ServerInfo.OWN_ID}`);
            this.qManager.insert(cmdb.createdFrom, cmdb);
            if(this.acComponent.waiting && this.acComponent.waitingForServerId === cmdb.createdFrom && cmdb.priority === this.acComponent.waitingPriority){
                this.acComponent.waiting = false;
                this.acComponent.onTrueDeliver(cmdb.createdFrom);
            }
        }

        // this.acComponent.startAgreementComponent();
    }

    public startAgreementComponent(){
        this.acComponent.startAgreementComponent();
    }

    public onReceiveCommand(c : ClientCommand){
        if(this.exComm.isExecuted(c)){
            console.log("Already executed command");
            return;
        }
        this.brComponent.onReceiveNotExecutedCommand(c);
    }

    public onFllGap(message : FILL_GAP_MESSAGE){
        this.acComponent.onFillGap(message);
    }

    public onFiller(message : FILLER_MESSAGE){
        message.commandBatches.forEach(cb=>{
            VCBCStore.handleCFinalMessage({
                hash : '',
                tag : cb.id,
                thresholdSignature : '',
                type : 'c-final'
            })
        });
    }


    
}



// class AleaBft{

    

    
//     public executedCommands : Set<string>;
//     public N : number;
//     public f : number;
//     public priorieyQueues : MinPriorityQueue<CommandBatch>[];
//     public batchSize : number;
//     public priority : number;
//     public batch : ClientCommand[];
//     public ownIndex : number;
//     public roundNo : number ;
//     public lastPriorities : number[];

    


//     constructor(N:number, f:number){

//         this.N = N;
//         this.f = f;
//         this.batchSize = 2;
//         this.priority = 0;

//         this.executedCommands = new Set<string>();
//         this.priorieyQueues = new Array(N);
//         this.lastPriorities = new Array(N);
//         for(let i=0; i<N; i++){
//             this.priorieyQueues[i] = new MinPriorityQueue<CommandBatch>(getCommandBatchPrioriy);
//             this.lastPriorities[i] = 0;
//         }
//         this.batch = [];
//         this.ownIndex = parseInt(ServerInfo.OWN_ID) - 1;
//         this.roundNo = 0;
//     }
    
//     public onReceiveCommand(command : ClientCommand){
//         if(this.executedCommands.has(command.id)){
//             return;
//         }
//         this.batch.push(command);
//         if(this.batch.length === this.batchSize){
//             this.priority++;
//             let batch : CommandBatch = {
//                 id : VCBC.getTag(ServerInfo.OWN_ID, this.priority),
//                 priority : this.priority,
//                 commands : this.batch,
//                 createdFrom : ServerInfo.OWN_ID
//             }
//             // todo
//             VCBCStore.startVCBC(batch.id, batch, this.onVcbcDecided);

//         }
//     }

//     public onVcbcDecided(commandBatch : CommandBatch){
//         if(this.executedCommands.has(commandBatch.id)){
//             return;
//         }
        
//         let from = serverIdToIndex(commandBatch.createdFrom);
//         this.priorieyQueues[from].enqueue(commandBatch);
//     }

//     public roundNoToServer(){
//         return this.roundNo % this.N;
//     }

//     public startAgreemenComponent(){
//         this.roundNo = 0;
//         // while(true){
//         let queueIndex = this.roundNoToServer();
//         let propose : boolean = this.priorieyQueues[queueIndex].size() > 0;
//         ABAStore.ABA_Start(propose, `${ServerInfo.OWN_ID}-${this.roundNo}`, (v)=>{
//             // todo
//             if(v){
//                 this.onTrueDeliver(queueIndex);
//             }

//             this.startAgreemenComponent();
//         });
//         // }
//     }

//     public onTrueDeliver(queueIndex : number){
//         if(this.priorieyQueues[queueIndex].size() > 0){
//             let cmd = this.priorieyQueues[queueIndex].front();
//             this.onAcDeliver(cmd);
//             this.executedCommands.add(cmd.id);
//             this.priorieyQueues[queueIndex].dequeue();
//         }
//         else{
//             let message : FILL_GAP_MESSAGE = {
//                 lastPriority : this.lastPriorities[queueIndex],
//                 queueIndex : queueIndex,
//                 requestedBy : ServerInfo.OWN_ID,
//                 roundNo : this.roundNo,
//             }
//             io.emit(AgreementComponentMessageType.FILL_GAP, message);

//         }
//     }

//     public onFillGap(message : FILL_GAP_MESSAGE){

//     }

//     public onAcDeliver(m : CommandBatch){
//         for(let i = 0; i < this.N; ++i){
//             this.priorieyQueues[i].remove((v)=>{
//                 return v.id === m.id
//             });
//         }
//         for(let i = 0; i < m.commands.length; ++i){
//             if(!this.executedCommands.has(m.commands[i].id)){
//                 // todo : log the executed commands in file
//                 console.log(`Executing command: ${m.id}`);
//                 this.executedCommands.add(m.commands[i].id);
//             }
//         }
//         this.lastPriorities[serverIdToIndex(m.createdFrom)] = m.priority;
//     }


// }