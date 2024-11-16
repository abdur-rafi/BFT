import { VCBCParty } from "./VCBCParty";
import {MessageType} from "./VCBCMessageTypes";

export class VCBCProtocol {
    parties: VCBCParty[];
    tag: string;

    constructor(parties: VCBCParty[], tag: string) {
        this.parties = parties;
        this.tag = tag;
    }

    // Broadcast a message
    broadcast(sender: VCBCParty, message: string) {
        console.log(`[VCBCProtocol] ${sender.id} initiating broadcast.`);
        const initialMessages = this.parties.map((party) =>
            party.handleBroadcast(this.tag, message, sender.id)
        );
        this.processMessages(initialMessages);
    }

    // Process messages and simulate message passing
    processMessages(messages: any[]) {
        const newMessages = [];
        for (const message of messages) {
            if (!message) continue;
            switch (message.type) {
                case MessageType.C_READY:
                    this.parties.forEach((party) => {
                        const readyResponse = party.handleReadyMessage(message);
                        if (readyResponse) newMessages.push(readyResponse);
                    });
                    break;
                case MessageType.C_FINAL:
                    this.parties.forEach((party) => {
                        const finalResponse = party.handleFinalMessage(message);
                        if (finalResponse) newMessages.push(finalResponse);
                    });
                    break;
                case MessageType.C_REQUEST:
                    this.parties.forEach((party) => {
                        const requestResponse = party.handleRequest(message);
                        if (requestResponse) newMessages.push(requestResponse);
                    });
                    break;
                case MessageType.C_ANSWER:
                    this.parties.forEach((party) => {
                        const answerResponse = party.handleAnswer(message);
                        if (answerResponse) newMessages.push(answerResponse);
                    });
                    break;
            }
        }
        if (newMessages.length > 0) this.processMessages(newMessages);
    }
}
