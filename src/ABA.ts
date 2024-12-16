import { BvStore } from "./BvBroadcast";
import { ioOps } from "./ioOps";
import { AUX_MESSAGE, MessageType } from "./messageTypes";
import { RandomSequence } from "./Random";
import { ServerInfo } from "./serverInfo";

class ABA{

    private est:boolean;
    private roundNo : number;
    // private auxMessageCount : [number, number];
    private auxMessageSet : Set<string>[];
    private id : string;
    private binValues : boolean[];
    private distinctProcesseses : Set<string>;
    private waitInRound : boolean;
    private values : boolean[];
    private decided : boolean;
    private waitedForBvValues : boolean;

    private auxMessagesRoundWise : Map<number, AUX_MESSAGE[]>;
    private onDecided : (v : boolean) => void;

    private initBeforeEachRound(){
        this.waitInRound = true;
        this.values = [];
        this.roundNo++;
        this.binValues = [];
        this.distinctProcesseses = new Set();
        this.values = [];
        this.waitedForBvValues = false;
        this.auxMessageSet = [new Set(), new Set()];

    }

    constructor(binValue: boolean, id : string, onDecided : (v : boolean)=>void){
        this.est = binValue;    
        this.roundNo = 0;
        // this.auxMessageCount = [0, 0];
        this.auxMessageSet = [new Set(), new Set()];
        this.id = id;
        this.binValues = [];
        this.distinctProcesseses = new Set();
        this.waitInRound = true;
        this.values = [];
        this.decided = false;
        this.waitedForBvValues = false;
        this.auxMessagesRoundWise = new Map();
        this.onDecided = onDecided;
    }

    public broadcastAux(binValue: boolean){
        // console.log(`broadcasting aux. serverId : ${ServerInfo.OWN_ID}`)
        let message : AUX_MESSAGE = {
            binValue: binValue,
            abaId : this.id,
            roundNo : this.roundNo,
            serverId: ServerInfo.OWN_ID
        }
        ioOps.emitAuxMessage(message);
        this.takeAuxMessage(message);
    }

    public oneRound(){
        this.initBeforeEachRound();

        BvStore.bvBroadcast(`${this.id}-${this.roundNo}`, this.est, (binvals)=>{
            this.binValues = binvals;
            this.broadcastAux(binvals[0]);
            this.waitedForBvValues = true;
            let pendingMessages = this.auxMessagesRoundWise.get(this.roundNo) || [];
            pendingMessages.forEach((message)=>{
                this.onAuxMessage(message);
            });
            
        });

    }

    public afterValues(){
        let rnd = RandomSequence.getNextRandom();
        // console.log(`Random value ${rnd}, values: ${this.values.join(", ")}`);
        if(this.values.length > 1){
            this.est = rnd;
        }
        else{
            if(rnd == this.values[0]){
                // console.log(`Decided value ${rnd}. id: ${this.id}`);
                this.onDecided(rnd);
                if(this.decided){
                    console.log(`Already decided`);
                    this.decided = true;
                }
                return;
            }
            else{
                this.est = this.values[0];
            }
        }
        this.oneRound();

    }

    public takeAuxMessage(message: AUX_MESSAGE){
        if(message.roundNo < this.roundNo){
            // console.log(`Old message received. roundNo: ${message.roundNo}, this.roundNo: ${this.roundNo}`);
            return;
        }
        if(this.waitedForBvValues && message.roundNo === this.roundNo){
            this.onAuxMessage(message);
        }
        else{
            if(!this.auxMessagesRoundWise.has(message.roundNo)){
                this.auxMessagesRoundWise.set(message.roundNo, []);
            }
            let messages = this.auxMessagesRoundWise.get(message.roundNo)!;
            messages.push(message);
        }
    }

    public onAuxMessage(message: AUX_MESSAGE){
        
        this.distinctProcesseses.add(message.serverId);
        let bvIndex = message.binValue ? 1 : 0;
        if(this.auxMessageSet[bvIndex].has(message.serverId)){
            return;
        }
        this.auxMessageSet[bvIndex].add(message.serverId);

        // console.log( "distinct processes size : " + this.distinctProcesseses.size)
        
        if(this.waitInRound && this.distinctProcesseses.size >= ServerInfo.GROUP_SIZE - ServerInfo.t){
            // console.log("(n-t) aux received")
            // console.log(this.distinctProcesseses);
            if(this.binValues.length > 1){
                if(this.auxMessageSet[0].size === this.distinctProcesseses.size){
                    this.values = [false];
                }
                else if(this.auxMessageSet[1].size === this.distinctProcesseses.size){
                    this.values = [true];
                }
                else{
                    this.values = [... this.binValues];
                }
                this.waitInRound = false;
                this.afterValues();

            }
            else if(this.binValues.length === 1){
                let bvIndex = this.binValues[0] ? 1 : 0;
                if(this.auxMessageSet[bvIndex].size === this.distinctProcesseses.size){
                    this.waitInRound = false;
                    this.values = [this.binValues[0]];
                    this.afterValues();
                }
            }
            else{
                console.log(`-------------------------No values in binValues---------------------------`);
            }
        }
    }

    public getWaitedForBvValues(){
        return this.waitedForBvValues;
    }
}

class ABAStore{
    private static abas : Map<string, ABA> = new Map();
    private static auxMessageStore : Map<string, AUX_MESSAGE[]> = new Map();

    public static getABA(id : string){
        return ABAStore.abas.get(id);
    }
    public static setABA(id : string, aba : ABA){
        ABAStore.abas.set(id, aba);
    }

    public static ABA_Start(binValue: boolean, id: string, onDeliver : (v : boolean)=>void){
        let aba = new ABA(binValue, id, onDeliver);
        ABAStore.setABA(id, aba);

        let messages = ABAStore.getMessagesForABA(id);
        messages.forEach((message)=>{
            aba.takeAuxMessage(message);
        });

        aba.oneRound();
        
    }

    public static onAuxMessage(message: AUX_MESSAGE){
        let aba = ABAStore.getABA(message.abaId);
        if(aba){
            aba.takeAuxMessage(message);
        }
        else{
            let messages = this.auxMessageStore.get(message.abaId);
            if(!messages){
                messages = [message];
                this.auxMessageStore.set(message.abaId, messages);
            }
            else{
                messages.push(message);
            }
        }
    }

    public static getMessagesForABA(id: string){
        let messages = ABAStore.auxMessageStore.get(id);
        return messages || [];
    }

    
}

export { ABAStore, ABA };