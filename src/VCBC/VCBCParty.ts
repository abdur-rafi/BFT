import {SignatureScheme} from "./SignatureScheme";
import {
    C_ANSWER_MESSAGE,
    C_DELIVER_MESSAGE,
    C_FINAL_MESSAGE,
    C_READY_MESSAGE,
    C_REQUEST_MESSAGE
} from "./VCBCMessageTypes";

export class VCBCParty {
    id: string; // Party identifier
    mBar: string | null; // m̄: Delivered message
    muBar: string | null; // µ̄: Threshold signature
    Wd: Set<string>; // Set of signature shares
    rd: number; // Counter for received valid signature shares
    signatureScheme: SignatureScheme;
    messageLog: Map<string, any>;

    constructor(id: string, signatureScheme: SignatureScheme) {
        this.id = id;
        this.mBar = null;
        this.muBar = null;
        this.Wd = new Set();
        this.rd = 0;
        this.signatureScheme = signatureScheme;
        this.messageLog = new Map(); // To store received messages
    }

    // Simulates receiving and processing a c-broadcast message
    handleBroadcast(tag: string, message: string, sender: string): C_READY_MESSAGE | null {
        if (this.mBar === null) {
            this.mBar = message;
            const hash = this.signatureScheme.hash(message);
            const signatureShare = this.signatureScheme.generateShare(`${tag}:${hash}`);
            console.log(`[Party ${this.id}] Broadcast received, sending c-ready.`);
            return <C_READY_MESSAGE>{type: "c-ready", tag, hash, signatureShare, sender: this.id};
        }
        return null;
    }

    // Simulates receiving and processing a c-ready message
    handleReadyMessage(message: C_READY_MESSAGE): C_FINAL_MESSAGE | null {
        let tag = message.tag;
        let hash = message.hash;
        let signatureShare = message.signatureShare;
        let sender = message.sender;

        if (this.muBar === null && this.signatureScheme.verifyShare(`${tag}:${hash}`, signatureShare)) {
            this.Wd.add(signatureShare);
            this.rd++;
            console.log(`[Party ${this.id}] Valid c-ready received from ${sender}.`);
            if (this.rd === Math.ceil((this.signatureScheme.totalParties + this.signatureScheme.t + 1) / 2)) {
                const thresholdSignature = this.signatureScheme.combineShares(Array.from(this.Wd));
                console.log(`[Party ${this.id}] Threshold signature created, sending c-final.`);
                return <C_FINAL_MESSAGE>{type: "c-final", tag, hash, thresholdSignature};
            }
        }
        return null;
    }

    // Simulates receiving and processing a c-final message
    handleFinalMessage(message: C_FINAL_MESSAGE): C_DELIVER_MESSAGE | null {
        let tag = message.tag;
        let hash = message.hash;
        let thresholdSignature = message.thresholdSignature;

        if (this.muBar === null && this.signatureScheme.verifySignature(`${tag}:${hash}`, thresholdSignature)) {
            this.muBar = thresholdSignature;
            console.log(`[Party ${this.id}] Final message verified and payload delivered: ${this.mBar}`);
            return <C_DELIVER_MESSAGE>{type: "c-deliver", message: this.mBar};
        }
        return null;
    }

    // Responds to c-request messages
    handleRequest(message: C_REQUEST_MESSAGE): C_ANSWER_MESSAGE | null {
        let tag = message.tag;
        let requester = message.sender;

        if (this.muBar !== null) {
            console.log(`[Party ${this.id}] Responding to c-request from ${requester}.`);
            return <C_ANSWER_MESSAGE>{type: "c-answer", tag, payload: this.mBar, thresholdSignature: this.muBar};
        }
        return null;
    }

    // Processes c-answer messages
    handleAnswer(message: C_ANSWER_MESSAGE): C_DELIVER_MESSAGE | null {
        let tag = message.tag;
        let payload = message.payload;
        let thresholdSignature = message.thresholdSignature;

        if (this.muBar === null && this.signatureScheme.verifySignature(`${tag}:${this.signatureScheme.hash(payload)}`, thresholdSignature)) {
            this.muBar = thresholdSignature;
            this.mBar = payload;
            console.log(`[Party ${this.id}] Payload delivered via c-answer: ${payload}`);
            return <C_DELIVER_MESSAGE>{type: "c-deliver", message: this.mBar};
        }
        return null;
    }
}
