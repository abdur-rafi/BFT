import { Socket } from "socket.io";

let PORT = process.env.PORT;
let ALL_PORTS = process.env.ALL_PORTS ? process.env.ALL_PORTS.split(",") : [];


let OWN_ID = process.env.OWN_ID;

let batchSize = process.env.BATCH_SIZE;

let cmdCount = process.env.COMMAND_COUNT;

if(!cmdCount){
    console.log("comd count not provided");
    process.exit(1);
}

if(!batchSize){
    console.error("No batch size provided");
    process.exit(1);
}
// console.log(process.env);

if(!PORT) {
    console.error("No port provided");
    process.exit(1);
}

if(ALL_PORTS.length === 0) {
    console.error("ALL ports " + process.env.ALL_PORTS);
    console.error("No peer ports provided");
    process.exit(1);
}

if(!OWN_ID) {
    console.error("No own id provided");
    process.exit(1);
}


class ServerInfo{

    public static PORT : number = parseInt(PORT!);
    public static PEER_PORTS : string[] = ALL_PORTS.filter(port => port !== OWN_ID);
    public static PEER_IDS : string[] = [];
    public static PEER_CONNECTIONS : Record<string, Socket> = {};
    public static OWN_ID : string = OWN_ID!;
    public static t = Math.floor(ALL_PORTS.length / 3)
    public static ALL_IDS : string[] = []
    
    public static storePeerIds(peerId : string, socket : Socket) {
        this.PEER_IDS.push(peerId);
        this.PEER_CONNECTIONS[peerId] = socket;
        this.ALL_IDS.push(peerId);
        this.ALL_IDS.sort();
        
    }
    public static N = ALL_PORTS.length;
    public static BatchSize = parseInt(batchSize!);
    public static commandCount = parseInt(cmdCount!);
}

// , ServerInfo.storePeerIds.bind(ServerInfo));

export { ServerInfo };