import { io as Client } from 'socket.io-client';
import { AUX_MESSAGE, BV_BROADCAST_MESSAGE, MessageType, READY_MESSAGE } from './messageTypes';
import { BvStore } from './BvBroadcast';
import { ServerInfo } from './serverInfo';
import { ABAStore } from './ABA';
import { VCBCMessageType } from './VCBC/VCBCMessageTypes';
import { VCBCStore } from './VCBC/VCBCStore';
import { AgreementComponentMessageType, AleaBft, CommandBatch, FILL_GAP_MESSAGE, FILLER_MESSAGE } from './aleaBft';
import { ioOps } from './ioOps';

let readySevers = new Set<string>();

export function connectToPeers(
    peers: string[], 
    ownId: string,
    onReady  : (alea : AleaBft)=>void
    // io : Server
    // cb: (peerId: string, socket: Socket) => void 
) {

    let alea = new AleaBft();  
    // const peerConnections: Record<string, Socket> = {};

    peers.forEach(peerPort => {
        const peerSocket = Client(`http://bft_server${peerPort}:${peerPort}`);
        peerSocket.on("connect", () => {
            // console.log(`Connected to server on port ${peerPort}`);
            // peerSocket.emit(MessageType.SERVER_ID, ownId);
            ioOps.emitServerId(peerSocket);
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
            // console.log(`Received READY message from ${message.serverId}`);
            // BvStore.startBvBroadcast(io, '1', false);
            readySevers.add(message.serverId);
            if(readySevers.size === ServerInfo.PEER_PORTS.length){
                // let value = Math.random() < 0.5;
                // value = false;
                // console.log(`Starting ABA with value ${value}`);
                // BvStore.bvBroadcast('1', value, ()=>{});
                // BvStore.bvBroadcast('2', !value, ()=>{});
                // BvStore.bvBroadcast('2', !value, ()=>{});
                // ABAStore.ABA_Start(value, '1');
                // ABAStore.ABA_Start(!value, '2');
                // let alea = new AleaBft();
                // alea.startAgreementComponent();
                // alea.onReceiveCommand({
                //     command : `execute ${ServerInfo.OWN_ID}`,
                //     id : ServerInfo.OWN_ID
                // })
                onReady(alea);
                
            }
        });

        peerSocket.on(MessageType.BV_BROADCAST, (message: BV_BROADCAST_MESSAGE) => {
            // console.log(`Received BV_BROADCAST message from ${message.serverId}: ${message.value}`);
            BvStore.onBvBroadcastMessage(message);
        });

        peerSocket.on(MessageType.AUX, (message : AUX_MESSAGE)=>{
            // console.log(`Received AUX message from ${message.serverId}: ${message.binValue}, message id ${message.abaId}`);
            ABAStore.onAuxMessage(message);
        })

        peerSocket.on(VCBCMessageType.C_SEND, (message) => {
            VCBCStore.handleCSendMessage(message);
        });

        peerSocket.on(VCBCMessageType.C_READY, (message) => {
            VCBCStore.handleCReadyMessage(message);
        });

        peerSocket.on(VCBCMessageType.C_FINAL, (message) => {
            VCBCStore.handleCFinalMessage(message);
        });

        peerSocket.on(VCBCMessageType.C_REQUEST, (message) => {
            VCBCStore.handleCRequestMessage(message);
        });

        peerSocket.on(VCBCMessageType.C_ANSWER, (message) => {
            VCBCStore.handleCAnswerMessage(message);
        });

        peerSocket.on(AgreementComponentMessageType.FILLER, (message : FILLER_MESSAGE) => {
            console.log(`Received filler message for ${message.requestedFor} from ${message.sentFrom} by ${message.requestedBy}`);
            alea.onFiller(message);
        });

        peerSocket.on(AgreementComponentMessageType.FILL_GAP, (message : FILL_GAP_MESSAGE) => {
            console.log(`Received fill gap message for ${message.requestedFor}  by ${message.requestedBy}`);
            // console.log(`Received fill gap message for ${message.requestedFor}`);
            alea.onFllGap(message);
        });
        
    });

    // return peerConnections;

}