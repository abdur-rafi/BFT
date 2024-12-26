import { ioOps } from "../ioOps";
import { ServerInfo } from "../serverInfo";
import { ExecuteCommand } from "./executeCommand";
import { ABA_Result } from "./types";

type ABA_Result_Without_ServerId = Omit<ABA_Result, 'serverId'>;

class ABAReultManagerSingleRoundAndGroup{
    private abaResultCount : Map<string, number>;
    private abaResults : ABA_Result[];
    private roundNo : number;
    private groupNo : number;
    private abaResultsReceivedFrom : Set<string>;
    private isConsensusReached : boolean;

    constructor(roundNo : number, groupNo : number){
        this.abaResultCount = new Map<string, number>();
        this.abaResults = [];
        this.roundNo = roundNo;
        this.groupNo = groupNo;
        this.abaResultsReceivedFrom = new Set<string>();
        this.isConsensusReached = false;
    }

    public onABAResult(message : ABA_Result) : boolean{
        if(message.groupNo !== this.groupNo || message.roundNo !== this.roundNo){
            console.error("Received ABA result from wrong group or round");
            return false;
        }
        if(this.abaResultsReceivedFrom.has(message.serverId)){
            console.log("Duplicate ABA result received");
            return false;
        }
        
        // console.log("ABA message ", message);

        this.abaResultsReceivedFrom.add(message.serverId);
        this.abaResults.push(message);

        let messageWithoutServerId : ABA_Result_Without_ServerId = {
            commandBatch : message.commandBatch,
            groupNo : message.groupNo,
            result : message.result,
            roundNo : message.roundNo
        }
        let keyString = JSON.stringify(messageWithoutServerId);
        let mapEntry = this.abaResultCount.get(keyString);

        // console.log("Key string: ", keyString);

        if(mapEntry){
            // console.log("Map entry found");
            this.abaResultCount.set(keyString, mapEntry + 1);
            // console.log("Map entry incremented to ", mapEntry + 1);
            // console.log("ServerInfo.t: ", ServerInfo.t);
            if(mapEntry + 1 > ServerInfo.t){
                this.isConsensusReached = true;
                if(ServerInfo.AM_I_LEADER){
                    let message_ : ABA_Result = {
                        commandBatch : message.commandBatch,
                        groupNo : this.groupNo,
                        result : message.result,
                        roundNo : this.roundNo,
                        serverId : ServerInfo.OWN_ID 
                    }
                    ioOps.emitConsensusReachedABAResult(message_);
                }
                return true;
            }
        }
        else{
            this.abaResultCount.set(keyString, 1);
        }
        return false;
    }

    public ifConsensusReached(){
        return this.isConsensusReached;
    }
}

class ABAResultManagerSingleRound{
    private groupResultsManagers : ABAReultManagerSingleRoundAndGroup[];
    private roundNo : number;
    private consensusResults : (ABA_Result | null)[];
    private consensusReachedUpto : number;
    constructor(roundNo : number){
        this.groupResultsManagers = [];
        this.roundNo = roundNo;
        this.consensusResults = [];
        for(let i = 0; i < ServerInfo.GROUP_SIZE; i++){
            this.groupResultsManagers.push(new ABAReultManagerSingleRoundAndGroup(roundNo, i));
            this.consensusResults.push(null);
        }
        this.consensusReachedUpto = -1;
    }

    private onConsensusReachedOfGroup(groupNo : number){
        if(groupNo == this.consensusReachedUpto + 1){
            this.consensusReachedUpto++;
            for(let i = this.consensusReachedUpto + 1; i < ServerInfo.GROUP_SIZE; i++){
                if(this.consensusResults[i] === null){
                    return;
                }
                this.consensusReachedUpto = i;
            }
        }
    }

    public onABAResult(message : ABA_Result) : boolean{
        if(message.roundNo !== this.roundNo){
            console.error("Received ABA result from wrong round");
            return false;
        }
        let groupManager = this.groupResultsManagers[message.groupNo];
        
        if(groupManager.ifConsensusReached()){
            // console.log(`Consensus already reached for this group ${message.groupNo} in round ${message.roundNo}`);
            return false;
        }

        let result = groupManager.onABAResult(message);

        if(result){
            
            // console.log("Consensus reached for group ", message.groupNo);

            this.consensusResults[message.groupNo] = message;
            this.onConsensusReachedOfGroup(message.groupNo);
            return true;
        }
        return false;
    }

    public getConsensusReachedUpto(){
        return this.consensusReachedUpto;
    }

    public getNthConsensusResult(n : number){
        return this.consensusResults[n];
    }
}

class ABAResultManager{

    private roundResultsManagers : Map<number, ABAResultManagerSingleRound>;
    constructor(){
        this.roundResultsManagers = new Map<number, ABAResultManagerSingleRound>();
    }

    public onABAResult(message : ABA_Result){
        let roundManager = this.roundResultsManagers.get(message.roundNo);
        if(!roundManager){
            // console.log("Creating new round manager for round ", message.roundNo);
            roundManager = new ABAResultManagerSingleRound(message.roundNo);
            this.roundResultsManagers.set(message.roundNo, roundManager);
        }
        else{
            // console.log("Round manager already exists for round ", message.roundNo);
        }
        return roundManager.onABAResult(message);
    }

    public isConsensusReached(roundNo : number, groupNo : number){
        let roundManager = this.roundResultsManagers.get(roundNo);
        if(!roundManager){

            return false;
        }
        if(roundManager.getConsensusReachedUpto() >= groupNo){
            return true;
        }
    }

    public getConsensusResult(roundNo : number, groupNo : number){
        let roundManager = this.roundResultsManagers.get(roundNo);
        if(!roundManager){
            throw new Error("Round not completed yet");
        }
        let result = roundManager.getNthConsensusResult(groupNo);
        if(!result){
            throw new Error("Consensus not reached yet");
        }
        return result;
    }

}

class ExecutionManager{
    private executeCommands : ExecuteCommand;
    private abaResultManager : ABAResultManager;
    private roundNo : number;
    private groupNo : number;

    constructor(){
        this.executeCommands = new ExecuteCommand();
        this.abaResultManager = new ABAResultManager();
        this.roundNo = 1;
        this.groupNo = 0;
    }

    public onABAResult(message : ABA_Result){
        if(message.roundNo < this.roundNo ){
            console.log("ExeM.onAba.Received ABA result from previous round");
            return;
        }
        if(message.roundNo === this.roundNo){
            if(message.groupNo < this.groupNo){
                console.log("ExeM.onAba.Received ABA result from completed group");
                return;
            }
            let result = this.abaResultManager.onABAResult(message);
            if(result){
                while(this.abaResultManager.isConsensusReached(this.roundNo, this.groupNo)){
                    let consensusResult = this.abaResultManager.getConsensusResult(this.roundNo, this.groupNo);
                    if(consensusResult.result){
                        let cmdBatch = consensusResult.commandBatch;
                        if(!cmdBatch){
                            throw new Error("Command batch should not be null");
                        }
                        for(let cmd of cmdBatch.commands){
                            this.executeCommands.executeIfNotAlready(cmd);
                        }
                    }
                    console.log("Round completed upto: ", this.roundNo, this.groupNo);
                    
                    let numberOfGroups = (ServerInfo.N / ServerInfo.GROUP_SIZE);

                    if(this.groupNo === numberOfGroups - 1){
                        this.roundNo++;
                        this.groupNo = 0;
                    }
                    else{
                        this.groupNo++;
                    }
                }
            }
        }
        else{
            let result = this.abaResultManager.onABAResult(message);
            // if(result){
            //     console.log(`Consensus reached for round before ${this.roundNo}`, message.roundNo);
            // }
        }
    }
}


export const abaResultManager = new ExecutionManager();