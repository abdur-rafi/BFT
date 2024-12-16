import { CommandBatch } from "../Alea/types";
import { ServerInfo } from "../serverInfo";
// import {SignatureScheme} from "./SignatureScheme";
import {
    C_ANSWER_MESSAGE,
    C_DELIVER_MESSAGE,
    C_FINAL_MESSAGE,
    C_READY_MESSAGE,
    C_REQUEST_MESSAGE,
    C_SEND_MESSAGE
} from "./VCBCMessageTypes";

export class VCBC {

    mBar: CommandBatch | null; // m̄: Delivered message
    muBar: string | null; // µ̄: Threshold signature
    Wd: Set<string>; // Set of signature shares
    rd: number; // Counter for received valid signature shares
    // signatureScheme: SignatureScheme;
    messageLog: Map<string, any>;
    tag : string;
    readyReceivedFrom : Set<string>;
    onDecide: (message: CommandBatch) => void;
    decided: boolean;

    constructor(tag: string, onDecide: (message: CommandBatch) => void) {
        this.tag = tag;
        this.mBar = null;
        this.muBar = null;
        this.Wd = new Set();
        this.rd = 0;
        // this.signatureScheme = signatureScheme;
        this.messageLog = new Map(); // To store received messages
        this.readyReceivedFrom = new Set();
        this.onDecide = onDecide;
        this.decided = false;
    }

    // Simulates receiving and processing a c-send message
    handleSendMessage(message : C_SEND_MESSAGE): C_READY_MESSAGE | null {
        if (this.mBar === null) {
            this.mBar = message.message;
            // const hash = this.signatureScheme.hash(message.message);
            // const signatureShare = this.signatureScheme.generateShare(`${message.tag}:${hash}`);
            // console.log(`[Party ${ServerInfo.OWN_ID}] Broadcast received, sending c-ready.`);
            // return <C_READY_MESSAGE>{type: "c-ready", tag : message.tag, hash, signatureShare, sender: ServerInfo.OWN_ID};
            return <C_READY_MESSAGE>{type: "c-ready", tag : message.tag, sender: ServerInfo.OWN_ID};
        }
        return null;
    }

    // Simulates receiving and processing a c-ready message
    handleReadyMessage(message: C_READY_MESSAGE): C_FINAL_MESSAGE | null {
        if(this.readyReceivedFrom.has(message.sender)){
            return null;
        }
        this.readyReceivedFrom.add(message.sender);

        let tag = message.tag;
        // let hash = message.hash;
        // let signatureShare = message.signatureShare;
        let sender = message.sender;

        // if (this.muBar === null && this.signatureScheme.verifyShare(`${tag}:${hash}`, signatureShare)) {
            if (this.muBar === null) {
            // this.Wd.add(signatureShare);
            this.rd++;
            // console.log(`[Party ${ServerInfo.OWN_ID}] Valid c-ready received from ${sender}.`);
            // if (this.rd === Math.ceil((this.signatureScheme.totalParties + this.signatureScheme.t + 1) / 2)) {
                if (this.rd === Math.ceil((ServerInfo.GROUP_SIZE + ServerInfo.t) / 2)) {
                // const thresholdSignature = this.signatureScheme.combineShares(Array.from(this.Wd));
                // console.log(`[Party ${ServerInfo.OWN_ID}] Threshold signature created, sending c-final.`);
                // return <C_FINAL_MESSAGE>{type: "c-final", tag, hash, thresholdSignature};
                return <C_FINAL_MESSAGE>{type: "c-final", tag};
            }
        }
        return null;
    }

    // Simulates receiving and processing a c-final message
    handleFinalMessage(message: C_FINAL_MESSAGE) {
        let tag = message.tag;
        // let hash = message.hash;
        // let thresholdSignature = message.thresholdSignature;

        // if ( this.mBar !== null && this.muBar === null && this.signatureScheme.verifySignature(`${tag}:${hash}`, thresholdSignature)) {
            if ( this.mBar !== null && this.muBar === null) {
            // this.muBar = thresholdSignature;
            // console.log(`[Party ${ServerInfo.OWN_ID}] Final message verified and payload delivered: ${JSON.stringify(this.mBar)}`);
            // return <C_DELIVER_MESSAGE>{type: "c-deliver", message: this.mBar};
            this.decided = true;
            this.onDecide(this.mBar);
        }
        // return null;
    }

    // Responds to c-request messages
    handleRequest(message: C_REQUEST_MESSAGE): C_ANSWER_MESSAGE | null {
        let tag = message.tag;
        let requester = message.sender;

        if (this.muBar !== null) {
            // console.log(`[Party ${ServerInfo.OWN_ID}] Responding to c-request from ${requester}.`);
            return <C_ANSWER_MESSAGE>{type: "c-answer", tag, message: this.mBar, thresholdSignature: this.muBar};
        }
        return null;
    }

    // Processes c-answer messages
    handleAnswer(message: C_ANSWER_MESSAGE) {
        let tag = message.tag;
        let payload = message.message;
        // let thresholdSignature = message.thresholdSignature;
        

        // if (this.muBar === null && this.signatureScheme.verifySignature(`${tag}:${this.signatureScheme.hash(payload)}`, thresholdSignature)) {
            if (this.muBar === null) {
            // this.muBar = thresholdSignature;
            this.mBar = payload;
            // console.log(`[Party ${ServerInfo.OWN_ID}] Payload delivered via c-answer: ${payload}`);
            // return <C_DELIVER_MESSAGE>{type: "c-deliver", message: this.mBar};
            this.decided = true;
            this.onDecide(this.mBar);

        }
        return null;
    }

    public static getTag(serverId : string, priority : number){
        return `${serverId}-${priority}`;
    }
}
