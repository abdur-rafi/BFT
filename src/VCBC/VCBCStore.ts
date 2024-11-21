import { exit } from "process";
import { io } from "..";
import { CommandBatch } from "../aleaBft";
import { ServerInfo } from "../serverInfo";
import { SignatureScheme } from "./SignatureScheme";
import { C_ANSWER_MESSAGE, C_FINAL_MESSAGE, C_READY_MESSAGE, C_REQUEST_MESSAGE, C_SEND_MESSAGE, VCBCMessageType } from "./VCBCMessageTypes";
import { VCBC } from "./VCBCParty";

export class VCBCStore{

    static vcbcMap : Map<string, VCBC> = new Map();
    static signatureScheme = new SignatureScheme(ServerInfo.t, ServerInfo.N);
    static onDecide : (message : CommandBatch) => void = (message : CommandBatch) => {
        console.error("Decide function not set");
        exit(1);
    };


    static async startVCBC(tag : string, message : CommandBatch){
        let m : C_SEND_MESSAGE = {
            type : 'c-send',
            message : message,
            sender : ServerInfo.OWN_ID,
            tag : tag
        }
        let vcbc = new VCBC(tag, this.signatureScheme, this.onDecide);
        this.vcbcMap.set(tag, vcbc);
        vcbc.mBar = message;
        io.emit(VCBCMessageType.C_SEND, m);
    }

    static async handleCSendMessage(message : C_SEND_MESSAGE){
        if(!this.vcbcMap.has(message.tag)){
            let vcbc = new VCBC(message.tag, this.signatureScheme, this.onDecide);
            this.vcbcMap.set(message.tag, vcbc);
            let cready = vcbc.handleSendMessage(message);
            if(cready){
                ServerInfo.PEER_CONNECTIONS[message.sender].emit('c-ready', cready);
            }
            else{
                console.error("Cready should not be null");
            }
        }
    }

    static async handleCReadyMessage(message : C_READY_MESSAGE){
        if(this.vcbcMap.has(message.tag)){
            let vcbc = this.vcbcMap.get(message.tag)!;
            if(vcbc.decided){
                return;
            }
            let cfinal = vcbc.handleReadyMessage(message);
            if(cfinal){
                io.emit(VCBCMessageType.C_FINAL, cfinal);
                vcbc.handleFinalMessage(cfinal);
            }
        }
        else{
            console.error("VCBC instance should be present");
        }
    }

    static async handleCFinalMessage(message : C_FINAL_MESSAGE){
        let vcbc = this.vcbcMap.get(message.tag);
        if(vcbc){
            if(vcbc.decided){
                return;
            }
            vcbc.handleFinalMessage(message);
        }
        else{
            let vcbc = new VCBC(message.tag, this.signatureScheme, this.onDecide);
            this.vcbcMap.set(message.tag, vcbc);
            vcbc.handleFinalMessage(message);
        }
    }

    static async handleCRequestMessage(message : C_REQUEST_MESSAGE){
        let vcbc = this.vcbcMap.get(message.tag);
        if(vcbc){
            let answer = vcbc.handleRequest(message);
            if(answer){
                ServerInfo.PEER_CONNECTIONS[message.sender].emit(VCBCMessageType.C_ANSWER, answer);
            }
        }
    }

    static async handleCAnswerMessage(message : C_ANSWER_MESSAGE){
        let vcbc = this.vcbcMap.get(message.tag);
        if(vcbc){
            if(vcbc.decided){
                return;
            }
            vcbc.handleAnswer(message);
        }
    }

}