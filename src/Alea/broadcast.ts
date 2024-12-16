import { BatchSize } from "../ExpConfig";
import { ServerInfo } from "../serverInfo";
import { VCBC } from "../VCBC/VCBCParty";
import { VCBCStore } from "../VCBC/VCBCStore";
import { ClientCommand, CommandBatch } from "./types";
import { serverIdToIndex } from "./utils";

export class BroadCastComponent{
    public batchSize : number;
    public priority : number;
    public ownIndex : number;
    public batch : ClientCommand[];

    constructor(){
        this.batchSize = BatchSize;
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
