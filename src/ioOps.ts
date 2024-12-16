import { Socket } from "socket.io-client";
import { allPeersRoom, io } from ".";
import { AgreementComponentMessageType, FILL_GAP_MESSAGE, FILLER_MESSAGE } from "./aleaBft";
import { AUX_MESSAGE, BV_BROADCAST_MESSAGE, MessageType, READY_MESSAGE } from "./messageTypes";
import { ServerInfo } from "./serverInfo";
import { C_ANSWER_MESSAGE, C_FINAL_MESSAGE, C_READY_MESSAGE, C_SEND_MESSAGE, VCBCMessageType } from "./VCBC/VCBCMessageTypes";

function emitCSendMessage(message : C_SEND_MESSAGE){
    io.to(ServerInfo.OWN_GROUP_OTHERS_ROOM).emit(VCBCMessageType.C_SEND, message);
}

function sendCReadyMessage(toServerId : string, message : C_READY_MESSAGE){
    // io.to(toServerId).emit(VCBCMessageType.C_READY, message);
    ServerInfo.PEER_CONNECTIONS[toServerId].emit(VCBCMessageType.C_READY, message);
}

function emitCFinalMessage(message : C_FINAL_MESSAGE){
    io.to(ServerInfo.OWN_GROUP_OTHERS_ROOM).emit(VCBCMessageType.C_FINAL, message);
}


function sendCAnswerMessage(toServerId : string, message : C_ANSWER_MESSAGE){
    ServerInfo.PEER_CONNECTIONS[toServerId].emit(VCBCMessageType.C_ANSWER, message);
}

function emitAuxMessage(message : AUX_MESSAGE){
    io.to(ServerInfo.OWN_GROUP_OTHERS_ROOM).emit(MessageType.AUX, message);
}

function emitFillGapMessage(message : FILL_GAP_MESSAGE){
    io.to(ServerInfo.OWN_GROUP_OTHERS_ROOM).emit(AgreementComponentMessageType.FILL_GAP, message);

}

function sendFillerMessage(toServerId : string, message : FILLER_MESSAGE){
    ServerInfo.PEER_CONNECTIONS[toServerId].emit(AgreementComponentMessageType.FILLER, message);
}

function emitBvBroadcastMessage(message : BV_BROADCAST_MESSAGE){
    io.to(ServerInfo.OWN_GROUP_OTHERS_ROOM).emit(MessageType.BV_BROADCAST, message);
}

function emitServerId(socket : Socket){
    socket.emit(MessageType.SERVER_ID, ServerInfo.OWN_ID);
}

function emitReadyMessage(message : READY_MESSAGE){
    io.to(allPeersRoom).emit(MessageType.READY, message);
}

export const ioOps = {
    emitCSendMessage,
    sendCReadyMessage,
    emitCFinalMessage,
    sendCAnswerMessage,
    emitAuxMessage,
    emitFillGapMessage,
    sendFillerMessage,
    emitBvBroadcastMessage,
    emitServerId,
    emitReadyMessage
}