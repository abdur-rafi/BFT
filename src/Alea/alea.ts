import { ServerInfo } from "../serverInfo";
import { VCBCStore } from "../VCBC/VCBCStore";
import { AgreementComponent } from "./agreement";
import { BroadCastComponent } from "./broadcast";
import { ExecuteCommand } from "./executeCommand";
import { QueueManager } from "./queueManager";
import { ClientCommand, FILL_GAP_MESSAGE, FILLER_MESSAGE } from "./types";

export class AleaBft{
    public brComponent : BroadCastComponent;
    public qManager : QueueManager;
    public exComm : ExecuteCommand;
    public acComponent : AgreementComponent;

    constructor(){
        this.qManager = new QueueManager();
        this.exComm = new ExecuteCommand();
        this.acComponent = new AgreementComponent(this.qManager, this.exComm);
        this.brComponent = new BroadCastComponent();
        // this.executeAfterCompletion = new Map();


        VCBCStore.onDecide = (cmdb)=>{
            // console.log(`Decided command batch with id ${cmdb.id} in server ${ServerInfo.OWN_ID}`);
            this.qManager.insert(cmdb.createdFrom, cmdb);
            if(this.acComponent.waiting && 
                this.acComponent.waitingForServerId === cmdb.createdFrom 
                && cmdb.priority === this.acComponent.waitingPriority
            ){
                this.acComponent.waiting = false;
                this.acComponent.onTrueDeliver(cmdb.createdFrom);
            }
        }

        // this.acComponent.startAgreementComponent();
    }

    public startAgreementComponent(){
        this.acComponent.startAgreementComponent();
    }

    public onReceiveCommand(c : ClientCommand, onExecute : ()=>void){
        if(this.exComm.isExecuted(c)){
            console.log("Already executed command");
            return;
        }
        this.exComm.executeAfterCompletion.set(c.id, onExecute);
        this.brComponent.onReceiveNotExecutedCommand(c);
    }

    public onFllGap(message : FILL_GAP_MESSAGE){
        this.acComponent.onFillGap(message);
    }

    public onFiller(message : FILLER_MESSAGE){
        message.commandBatches.forEach(cb=>{
            VCBCStore.handleCFinalMessage({
                // hash : '',
                tag : cb.id,
                // thresholdSignature : '',
                type : 'c-final'
            })
        });
    }

    public flushCommands(){
        this.exComm.flush();
    }
}