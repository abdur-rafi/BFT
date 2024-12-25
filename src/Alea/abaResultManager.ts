import { ServerInfo } from "../serverInfo";
import { ExecuteCommand } from "./executeCommand";
import { ABA_Result } from "./types";

class ABAReultManagerSingleRoundAndGroup{
    private abaResultCount : Map<string, number>;
    private abaResults : ABA_Result[];
    private roundNo : number;
    private groupNo : number;
    private abaResultsReceivedFrom : Set<string>;

    constructor(roundNo : number, groupNo : number){
        this.abaResultCount = new Map<string, number>();
        this.abaResults = [];
        this.roundNo = roundNo;
        this.groupNo = groupNo;
        this.abaResultsReceivedFrom = new Set<string>();
    }

    public onABAResult(message : ABA_Result) : boolean{
        if(message.groupNo !== this.groupNo || message.roundNo !== this.roundNo){
            console.error("Received ABA result from wrong group or round");
            return false;
        }
        if(this.abaResultsReceivedFrom.has(message.serverId)){
            return false;
        }

        this.abaResultsReceivedFrom.add(message.serverId);
        this.abaResults.push(message);

        let keyString = JSON.stringify(message);
        let mapEntry = this.abaResultCount.get(keyString);

        if(mapEntry){
            this.abaResultCount.set(keyString, mapEntry + 1);
            if(mapEntry + 1 > ServerInfo.t){
                return true;
            }
        }
        else{
            this.abaResultCount.set(keyString, 1);
        }
        return false;
    }
}

class ABAResultManagerSingeRound{
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
        let result = groupManager.onABAResult(message);
        if(result){
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

    private roundResultsManagers : Map<number, ABAResultManagerSingeRound>;
    private roundCompletedUpto : number;
    constructor(){
        this.roundResultsManagers = new Map<number, ABAResultManagerSingeRound>();
        this.roundCompletedUpto = -1;
    }

    public onABAResult(message : ABA_Result){
        if(message.roundNo <= this.roundCompletedUpto){
            return;
        }
        let roundManager = this.roundResultsManagers.get(message.roundNo);
        if(!roundManager){
            roundManager = new ABAResultManagerSingeRound(message.roundNo);
            this.roundResultsManagers.set(message.roundNo, roundManager);
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

    public increaseRoundCompletedUpto(){
        this.roundCompletedUpto++;
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
        this.roundNo = 0;
        this.groupNo = 0;
    }

    public onABAResult(message : ABA_Result){
        if(message.roundNo < this.roundNo ){
            return;
        }
        if(message.roundNo === this.roundNo){
            if(message.groupNo < this.groupNo){
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
                    this.groupNo++;
                }
            }
        }
        else{
            this.abaResultManager.onABAResult(message);
        }

    }


}