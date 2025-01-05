// src/index.ts
import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {ServerInfo} from './serverInfo';
import {MessageType, READY_MESSAGE} from './messageTypes';
import {connectToPeers} from './connectToPeers';
import { ioOps } from './ioOps';
import { AleaBft } from './Alea/alea';
import { ClientCommand } from './Alea/types';
import { time } from 'console';

const PORT = process.env.PORT || 3000;


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});
let commandCount = 0;


ServerInfo.onReady =  (alea : AleaBft)=>{
    console.log("All servers ready");
    console.log(`Malicious : ${ServerInfo.IS_MALICIOUS}`)
    if(!ServerInfo.IS_MALICIOUS){

        alea.startAgreementComponent();
    
        // -------------- For delay calculation, it is not needed --------------
        // if (experimentMode === "Throughput") {
            for (let i = 0; i < ServerInfo.commandCount; i++) {
                let command: ClientCommand = {
                    command: `execute ${ServerInfo.OWN_ID}`,
                    id: `${ServerInfo.OWN_ID}_${commandCount++}`
                }
                console.log(`command: ${command.id} ${Date.now()}`);
                alea.onReceiveCommand(command, () => {
                });
            }
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
    }
}

connectToPeers(ServerInfo.PEER_PORTS, ServerInfo.OWN_ID);

export const allPeersRoom = "allPeers";


io.on("connection", (socket) => {

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
            ioOps.emitReadyMessage(message);
            ServerInfo.allPeersConnected = true;
            ServerInfo.calculateGroupInfo();
        }
    });

});



httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`own Id is ${ServerInfo.OWN_ID}`);
    // BvStore.startBvBroadcast(io,'1',false);
});

export {io};