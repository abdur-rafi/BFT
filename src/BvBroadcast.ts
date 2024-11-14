import { randomUUID } from "crypto";
import { Server } from "socket.io";
import { BV_BROADCAST_MESSAGE, MessageType } from "./messageTypes";
import { ServerInfo } from "./serverInfo";
import { allPeersRoom, io } from ".";

class BvBrodcast{

    private id: string;
    private io: Server;
    private valueStore: Set<string>[];
    // private countStore: Map<boolean, number>;
    private binValues: boolean[];
    private group : string;
    private broadcasted : Set<boolean>;
    private bvNonEmptyCallBack : (binValues: boolean[]) => void;

    constructor(group : string, id?: string){
        this.id = id ? id : randomUUID();
        this.io = io;
        this.valueStore = [new Set(), new Set()];
        // this.countStore = new Map();
        this.binValues = [];
        this.group = group;
        this.broadcasted = new Set();
        this.bvNonEmptyCallBack = (binValues: boolean[]) => {};
    }

    public broadcast(binValue: boolean){
        // if(this.broadcasted.has(binValue)){
        //     // console.log(`Already broadcasted value ${binValue} with id ${this.id}`);
        //     return;
        // }
        console.log(`Broadcasting value ${binValue} with id ${this.id}`);

        let message : BV_BROADCAST_MESSAGE = {
            id: this.id,
            value: binValue,
            serverId: ServerInfo.OWN_ID
        }
        this.broadcasted.add(binValue);

        this.io.to(this.group).emit(MessageType.BV_BROADCAST, message);
    }

    public onReceiveBVal(binValue:boolean, serverId: string){
        let bvIndex = binValue ? 1 : 0;
        if(this.valueStore[bvIndex].has(serverId)){
            // console.log(`Received value from ${serverId} already`);
            return;
        }
        
        this.valueStore[bvIndex].add(serverId);
        let count = this.valueStore[bvIndex].size;
        if(count === (ServerInfo.t + 1)){
            this.broadcast(binValue);
        }
        if(count === (2 * ServerInfo.t + 1)){
            this.binValues.push(binValue);
            console.log(`Added value ${binValue} to binValues. bvId : ${this.id}`);
            this.bvNonEmptyCallBack(this.binValues);
            return true;
        }
        return false;

    }

    public getId(){
        return this.id;
    }

    public setBvNonEmptyCallBack(cb: (binValues: boolean[]) => void){
        this.bvNonEmptyCallBack = cb;
    }
}

class BvStore{

    public static bvStore : Map<string, BvBrodcast> = new Map();
    public static bvMessageStore : Map<string, BV_BROADCAST_MESSAGE[]> = new Map();

    public static addBvBroadcast(bv : BvBrodcast){
        BvStore.bvStore.set(bv.getId(), bv);
    }

    public static getBvBroadcast(id : string){
        return BvStore.bvStore.get(id);
    }

    public static hasBvBroadcast(id : string){
        return BvStore.bvStore.has(id);
    }
    
    public static onBvBroadcastMessage(message : BV_BROADCAST_MESSAGE){
        let bv = BvStore.getBvBroadcast(message.id);
        if(bv){
            bv.onReceiveBVal(message.value, message.serverId);
        }
        else{
            let messages = this.bvMessageStore.get(message.id);
            if(!messages){
                messages = [message];
                this.bvMessageStore.set(message.id, messages);
            }
            else{
                messages.push(message);
            }

        }
    }

    public static bvBroadcast(id : string, binValue: boolean, bvBroadcastCallback : (binValues: boolean[]) => void){
        let bv = new BvBrodcast(allPeersRoom, id);
        bv.setBvNonEmptyCallBack(bvBroadcastCallback);
        BvStore.addBvBroadcast(bv);
        bv.broadcast(binValue);
        bv.onReceiveBVal(binValue, ServerInfo.OWN_ID);
        
        let storedMessages = this.bvMessageStore.get(id);
        if(storedMessages && storedMessages.length > 0){
            storedMessages.forEach(m => bv.onReceiveBVal(m.value, m.serverId))
        }
        return bv;
    }
}

export { BvBrodcast, BvStore };