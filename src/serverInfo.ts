import { Socket } from "socket.io";
import {groupSize, numberOfPortsTakenInExperiment, t} from "./ExpConfig";
import { AleaBft } from "./Alea/alea";
import { exit } from "process";

let PORT = process.env.PORT;
let ALL_PORTS = process.env.ALL_PORTS ? process.env.ALL_PORTS.split(",") : [];
ALL_PORTS.sort();

ALL_PORTS = ALL_PORTS.slice(0, numberOfPortsTakenInExperiment);
let FAIL = process.env.FAIL == "true";
let MALICIOUS = process.env.MALICIOUS == "true";


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

let OWN_ID = ALL_PORTS.indexOf(PORT).toString();

console.log(`OWN_ID: ${OWN_ID}`);

class ServerInfo{

    public static PORT : number = parseInt(PORT!);
    public static PEER_PORTS : string[] = ALL_PORTS.filter(port => port != PORT);
    public static PEER_IDS : string[] = [];

    // peerId to socket
    public static PEER_CONNECTIONS : Record<string, Socket> = {};
    
    // own id is the index of the port in the ALL_PORTS sorted array
    public static OWN_ID : string = OWN_ID!;
    public static t = t;
    public static ALL_IDS : string[] = [OWN_ID];
    public static N = ALL_PORTS.length;
    
    public static OWN_GROUP_ID : number = 0;
    public static OWN_GROUP_OTHERS_IDS : string[] = [];
    public static ONW_GROUP_LEADER_IDS : string[] = [];
    // public static OWN_GROUP_LEADERS_IDS : string[] = [];
    public static AM_I_LEADER : boolean = false;
    public static SHOULD_FAIL : boolean = FAIL;
    public static IS_MALICIOUS : boolean = MALICIOUS;
    public static OTHER_GROUP_LEADERS_IDS : string[] = [];
    
    public static GROUP_SIZE : number = groupSize;

    public static OWN_GROUP_OTHERS_ROOM = "ownGroupOthers";
    public static OTHER_GROUP_LEADERS_ROOM = "otherGroupLeaders";
    public static OWN_GROUP_NON_LEADERS_ROOM = "ownGroupNonLeaders";

    public static OWN_GROUP_IDS : string[] = [];

    public static allPeersConnected = false;
    public static allPeersReady = false;
    
    public static onReady : (alea : AleaBft)=>void = ()=>{};

    public static alea : AleaBft;

    
    public static storePeerIds(peerId : string, socket : Socket) {
        this.PEER_IDS.push(peerId);
        this.PEER_CONNECTIONS[peerId] = socket;
        this.ALL_IDS.push(peerId);
        this.ALL_IDS.sort();
        
    }

    private static calculateGroupIdFromSerial(serial : number){
        return (Math.floor((serial / this.GROUP_SIZE)));
    }

    private static isLeader(serial : number){
        let modulo = serial % this.GROUP_SIZE;
        return modulo < 2 * this.t + 1;
    }

    public static calculateGroupInfo(){
        
        if(!this.allPeersConnected || !this.allPeersReady){
            console.log("Not all peers connected or ready");
            return;
        }

        let own_serial = parseInt(this.OWN_ID);
        this.OWN_GROUP_ID = this.calculateGroupIdFromSerial(own_serial);
        
        this.AM_I_LEADER = this.isLeader(own_serial);
        
        let all_ports = [... this.PEER_PORTS, this.PORT.toString()];
        all_ports.sort();
        
        for(let i = 0; i < this.N; ++i){
            let current_group = this.calculateGroupIdFromSerial(i);
            if(current_group === this.OWN_GROUP_ID){
                if(i !== own_serial){
                    this.OWN_GROUP_OTHERS_IDS.push(i.toString());
                    this.PEER_CONNECTIONS[i.toString()].join(this.OWN_GROUP_OTHERS_ROOM);

                    if( this.AM_I_LEADER && !this.isLeader(i)){
                        this.PEER_CONNECTIONS[i.toString()].join(this.OWN_GROUP_NON_LEADERS_ROOM);
                    }
                }
            }
            else{
                if(this.isLeader(i)){
                    this.OTHER_GROUP_LEADERS_IDS.push(i.toString());
                    this.PEER_CONNECTIONS[i.toString()].join(this.OTHER_GROUP_LEADERS_ROOM);
                }
            }
        }

        this.OWN_GROUP_IDS = [this.OWN_ID, ... this.OWN_GROUP_OTHERS_IDS];
        this.OWN_GROUP_IDS.sort();
        
        this.OWN_GROUP_IDS.forEach(id => {
            if(this.isLeader(parseInt(id))){
                this.ONW_GROUP_LEADER_IDS.push(id);
            }
        });

        console.log({
            groupId : this.OWN_GROUP_ID,
            groupSize : this.GROUP_SIZE,
            ownGroupOthersIds : this.OWN_GROUP_OTHERS_IDS,
            amILeader : this.AM_I_LEADER,
            otherGroupLeadersIds : this.OTHER_GROUP_LEADERS_IDS,
            ownGroupIds : this.OWN_GROUP_IDS,
            allIds : this.ALL_IDS,
            ownGroupLeaderIds : this.ONW_GROUP_LEADER_IDS
        })

        if(ServerInfo.SHOULD_FAIL){
            console.log("Faulty server. Exiting");
            exit(0);
        }

        ServerInfo.alea = new AleaBft();

        this.onReady(ServerInfo.alea);
    }
    public static BatchSize = parseInt(batchSize!);
    public static commandCount = parseInt(cmdCount!);
}

// , ServerInfo.storePeerIds.bind(ServerInfo));

export { ServerInfo };