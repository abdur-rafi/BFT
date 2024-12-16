import { exit } from "process";
import { ServerInfo } from "../serverInfo";
// import { SignatureScheme } from "./SignatureScheme";
import { C_ANSWER_MESSAGE, C_FINAL_MESSAGE, C_READY_MESSAGE, C_REQUEST_MESSAGE, C_SEND_MESSAGE, VCBCMessageType } from "./VCBCMessageTypes";
import { VCBC } from "./VCBCParty";
import { ioOps } from "../ioOps";
import { CommandBatch } from "../Alea/types";

export class VCBCStore{

    static vcbcMap : Map<string, VCBC> = new Map();
    // static signatureScheme = new SignatureScheme(ServerInfo.t, ServerInfo.N);
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
        // let vcbc = new VCBC(tag, this.signatureScheme, this.onDecide);
        let vcbc = new VCBC(tag, this.onDecide);
        this.vcbcMap.set(tag, vcbc);
        vcbc.mBar = message;
        ioOps.emitCSendMessage(m);
    }

    static async handleCSendMessage(message : C_SEND_MESSAGE){
        if(!this.vcbcMap.has(message.tag)){
            // let vcbc = new VCBC(message.tag, this.signatureScheme, this.onDecide);
            let vcbc = new VCBC(message.tag, this.onDecide);
            this.vcbcMap.set(message.tag, vcbc);
            let cready = vcbc.handleSendMessage(message);
            if(cready){
                ioOps.sendCReadyMessage(message.sender, cready);
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
                ioOps.emitCFinalMessage(cfinal);
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
            // let vcbc = new VCBC(message.tag, this.signatureScheme, this.onDecide);
            let vcbc = new VCBC(message.tag, this.onDecide);
            this.vcbcMap.set(message.tag, vcbc);
            vcbc.handleFinalMessage(message);
        }
    }

    static async handleCRequestMessage(message : C_REQUEST_MESSAGE){
        let vcbc = this.vcbcMap.get(message.tag);
        if(vcbc){
            let answer = vcbc.handleRequest(message);
            if(answer){
                ioOps.sendCAnswerMessage(message.sender, answer);
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