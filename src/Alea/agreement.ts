import { ABAStore } from "../ABA";
import { ioOps } from "../ioOps";
import { ServerInfo } from "../serverInfo";
import { ExecuteCommand } from "./executeCommand";
import { QueueManager } from "./queueManager";
import { FILL_GAP_MESSAGE, CommandBatch, FILLER_MESSAGE, ABA_Result } from "./types";

export class AgreementComponent{
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
        return ServerInfo.OWN_GROUP_IDS[this.roundNo % ServerInfo.GROUP_SIZE];
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
                let message : ABA_Result = {
                    groupId : ServerInfo.OWN_GROUP_ID,
                    roundNo : this.roundNo,
                    result : v,
                    serverId : serverId,
                    commandBatch : null
                }
                ioOps.emitABAResult(message);
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

            let message : ABA_Result = {
                groupId : ServerInfo.OWN_GROUP_ID,
                roundNo : this.roundNo,
                result : true,
                serverId : serverId,
                commandBatch : cmd
            }
            ioOps.emitABAResult(message);

            this.startAgreementComponent();
        }
        else{
            let message : FILL_GAP_MESSAGE = {
                lastPriority : this.qManager.getLastPriority(serverId),
                requestedFor : serverId,
                requestedBy : ServerInfo.OWN_ID,
                roundNo : this.roundNo,
            }
            ioOps.emitFillGapMessage(message);
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
            ioOps.sendFillerMessage(message.requestedBy, msg);
        }
    }

}
