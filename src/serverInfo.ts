import { Socket } from "socket.io";
import { connectToPeers } from "./connectToPeers";

let PORT = process.env.PORT;
let PEER_PORTS = process.env.PEER_PORTS ? process.env.PEER_PORTS.split(",") : [];
// let PEER_CONNECTIONS: Record<string, Socket> = connectToPeers(PEER_PORTS);
let OWN_ID = process.env.OWN_ID;

if(!PORT) {
    console.error("No port provided");
    process.exit(1);
}

if(PEER_PORTS.length === 0) {
    console.error("No peer ports provided");
    process.exit(1);
}

if(!OWN_ID) {
    console.error("No own id provided");
    process.exit(1);
}


class ServerInfo{

    public static PORT : number = parseInt(PORT!);
    public static PEER_PORTS : string[] = PEER_PORTS;
    public static PEER_IDS : string[] = [];
    public static PEER_CONNECTIONS : Record<string, Socket> = {};
    public static OWN_ID : string = OWN_ID!;
    public static t = Math.floor(PEER_PORTS.length / 3)
    
    public static storePeerIds(peerId : string, socket : Socket) {
        this.PEER_IDS.push(peerId);
        this.PEER_CONNECTIONS[peerId] = socket;
    }
}

// , ServerInfo.storePeerIds.bind(ServerInfo));

export { ServerInfo };