// src/index.ts
import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {ServerInfo} from './serverInfo';
import {MessageType, READY_MESSAGE} from './messageTypes';
import {connectToPeers} from './connectToPeers';
import {AleaBft, ClientCommand} from './aleaBft';
import {cmdCountForThroughput, experimentMode} from "./ExpConfig";

const PORT = process.env.PORT || 3000;
// const PEER_PORTS = process.env.PEER_PORTS ? process.env.PEER_PORTS.split(",") : []; // Comma-separated ports of peer servers

// if(PEER_PORTS.length === 0) {
//     console.error("No peer ports provided");
//     process.exit(1);
// }



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
let commandCount = 0;

connectToPeers(ServerInfo.PEER_PORTS, ServerInfo.OWN_ID, (alea : AleaBft)=>{
    // let alea = new AleaBft();  
    console.log("All servers ready");
    // alea.startAgreementComponent();

    // -------------- For delay calculation, it is not needed --------------
    // if (experimentMode === "Throughput") {
    //     for (let i = 0; i < cmdCountForThroughput; i++) {
    //         let command: ClientCommand = {
    //             command: `execute ${ServerInfo.OWN_ID}`,
    //             id: `${ServerInfo.OWN_ID}_${commandCount++}`
    //         }
    //         console.log(`New command id: ${command.id}`);
    //         alea.onReceiveCommand(command, () => {
    //         });
    //     }
    // }
    // -------------- For delay calculation, it is not needed --------------

    app.get('/', (req, res)=>{
        let command : ClientCommand = {
            command : `execute ${ServerInfo.OWN_ID}`,
            id : `${ServerInfo.OWN_ID}_${commandCount++}`
        }
        console.log(`New command id: ${command.id}`);
        alea.onReceiveCommand(command, ()=>{
            res.status(200).end(`Command Sent to ${ServerInfo.OWN_ID}`);
        });
    })

    app.get('/flush', (req, res)=>{
        alea.flushCommands();
        res.status(200).end(`Flushed commands`);
    });

    app.get('/serverinfo', (req, res)=>{
        res.status(200).json({
            groupId : ServerInfo.OWN_GROUP_ID,
            groupSize : ServerInfo.GROUP_SIZE,
            ownGroupOthersIds : ServerInfo.OWN_GROUP_OTHERS_IDS,
            amILeader : ServerInfo.AM_I_LEADER,
            otherGroupLeadersIds : ServerInfo.OTHER_GROUP_LEADERS_IDS
        });
    })
})

export const allPeersRoom = "allPeers";

let readySevers = new Set<string>();

io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);

    socket.on("message", (message) => {
        // console.log(`Message from ${socket.id}: ${message}`);
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    socket.on(MessageType.SERVER_ID, (peerId: string) => {
        // console.log(`Received server id from server ${socket.id}: ${peerId}`);
        ServerInfo.storePeerIds(peerId, socket);
        socket.join(allPeersRoom);
        if(ServerInfo.PEER_IDS.length === ServerInfo.PEER_PORTS.length) {
            console.log("All peer servers connected");
            console.log(`All ids: ${ServerInfo.ALL_IDS}`);
            // BvStore.startBvBroadcast(io, '1', false);
            let message : READY_MESSAGE = {
                serverId: ServerInfo.OWN_ID
            }
            io.to(allPeersRoom).emit(MessageType.READY,message);
            ServerInfo.calculateGroupInfo();
        }
    });
    
    // socket.on(MessageType.BV_BROADCAST, (message: BV_BROADCAST_MESSAGE) => {
    //     console.log(`Received BV_BROADCAST message from ${message.serverId}: ${message.value}`);
    //     BvStore.onBvBroadcastMessage(message, io);
    // });

    // socket.on(MessageType.READY, (message : READY_MESSAGE) => {
    //     console.log(`Received READY message from ${message.serverId}`);
    //     // BvStore.startBvBroadcast(io, '1', false);
    //     readySevers.add(message.serverId);
    //     if(readySevers.size === ServerInfo.PEER_PORTS.length){
    //         BvStore.startBvBroadcast(io, '1', false);
    //     }
    // });

});


// const peerConnections: Record<string, Socket> = connectToPeers(PEER_PORTS);

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`own Id is ${ServerInfo.OWN_ID}`);
    // BvStore.startBvBroadcast(io,'1',false);
});

export {io};