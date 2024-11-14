import { io as Client, io, Socket } from 'socket.io-client';
import { BV_BROADCAST_MESSAGE, MessageType, READY_MESSAGE } from './messageTypes';
import { BvStore } from './BvBroadcast';
import { ServerInfo } from './serverInfo';
import { Server } from 'socket.io';

let readySevers = new Set<string>();

export function connectToPeers(
    peers: string[], 
    ownId: string,
    io : Server
    // cb: (peerId: string, socket: Socket) => void 
) 
    {

    // const peerConnections: Record<string, Socket> = {};

    peers.forEach(peerPort => {
        const peerSocket = Client(`http://bft_server${peerPort}:${peerPort}`);
        peerSocket.on("connect", () => {
            console.log(`Connected to server on port ${peerPort}`);
            peerSocket.emit(MessageType.SERVER_ID, ownId);
        });
        // peerSocket.on(MessageType.SERVER_ID, (peerId: string) => {
        //     console.log(`Received server id from server ${peerPort}: ${peerId}`);
        //     cb(peerId, peerSocket);
        // });
        // peerSocket.on("message", (message) => {
        //     console.log(`Received message from server ${peerPort}: ${message}`);
        // });
        // peerConnections[peerPort] = peerSocket;
        peerSocket.on(MessageType.READY, (message : READY_MESSAGE) => {
            console.log(`Received READY message from ${message.serverId}`);
            // BvStore.startBvBroadcast(io, '1', false);
            readySevers.add(message.serverId);
            if(readySevers.size === ServerInfo.PEER_PORTS.length){
                BvStore.startBvBroadcast(io, '1', false);
            }
        });

        peerSocket.on(MessageType.BV_BROADCAST, (message: BV_BROADCAST_MESSAGE) => {
            console.log(`Received BV_BROADCAST message from ${message.serverId}: ${message.value}`);
            BvStore.onBvBroadcastMessage(message, io);
        });
        
    });

    // return peerConnections;

}