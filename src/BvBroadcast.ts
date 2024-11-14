import { randomUUID } from "crypto";
import { Server } from "socket.io";
import { BV_BROADCAST_MESSAGE, MessageType } from "./messageTypes";
import { ServerInfo } from "./serverInfo";
import { allPeersRoom } from ".";

class BvBrodcast{

    private id: string;
    private io: Server;
    private valueStore: Set<string>[];
    private countStore: Map<boolean, number>;
    private binValues: boolean[];
    private group : string;
    private broadcasted : Set<boolean>;

    constructor(io: Server, group : string, id?: string){
        this.id = id ? id : randomUUID();
        this.io = io;
        this.valueStore = [new Set(), new Set()];
        this.countStore = new Map();
        this.binValues = [];
        this.group = group;
        this.broadcasted = new Set();
    }

    public boradcast(binValue: boolean){
        if(this.broadcasted.has(binValue)){
            // console.log(`Already broadcasted value ${binValue} with id ${this.id}`);
            return;
        }
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
            console.log(`Received value from ${serverId} already`);
            return;
        }
        
        this.valueStore[bvIndex].add(serverId);

        if(!this.countStore.has(binValue)){
            this.countStore.set(binValue, 0);
        }
        this.countStore.set(binValue, this.countStore.get(binValue)! + 1);
        let count = this.countStore.get(binValue)!;
        if(count === (ServerInfo.t + 1)){
            this.boradcast(binValue);
        }
        if(count === (2 * ServerInfo.t + 1)){
            this.binValues.push(binValue);
            console.log(`Added value ${binValue} to binValues`);
            return true;
        }
        return false;

    }

    public getId(){
        return this.id;
    }


}

class BvStore{

    public static bvStore : Map<string, BvBrodcast> = new Map();

    public static addBvBroadcast(bv : BvBrodcast){
        BvStore.bvStore.set(bv.getId(), bv);
    }

    public static getBvBroadcast(id : string){
        return BvStore.bvStore.get(id);
    }

    public static hasBvBroadcast(id : string){
        return BvStore.bvStore.has(id);
    }
    
    public static onBvBroadcastMessage(message : BV_BROADCAST_MESSAGE, io: Server){
        let bv = BvStore.getBvBroadcast(message.id);
        if(!bv){
            bv = new BvBrodcast(io, allPeersRoom, message.id);
            BvStore.addBvBroadcast(bv);
        }
        bv!.onReceiveBVal(message.value, message.serverId);
    }

    public static startBvBroadcast(io: Server, id : string, binValue: boolean){
        let bv = new BvBrodcast(io, allPeersRoom, id);
        bv.boradcast(binValue);
        BvStore.addBvBroadcast(bv);
    }
}

export { BvBrodcast, BvStore };