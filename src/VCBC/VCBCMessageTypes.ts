import { CommandBatch } from "../aleaBft"

export const VCBCMessageType = {
    C_READY : 'c-ready',
    C_FINAL : 'c-final',
    C_REQUEST : 'c-request',
    C_ANSWER : 'c-answer',
    C_DELIVER : 'c-deliver',
    C_SEND : 'c-send'
}

export type C_READY_MESSAGE = {
    type: 'c-ready',
    tag: string,
    hash: string,
    signatureShare: string,
    sender: string,
}

export type C_FINAL_MESSAGE = {
    type: 'c-final',
    tag: string,
    hash: string,
    thresholdSignature: string
}

export type C_REQUEST_MESSAGE = {
    type: 'c-request',
    tag: string,
    sender: string
}

export type C_ANSWER_MESSAGE = {
    type: 'c-answer',
    tag: string,
    message: CommandBatch,
    thresholdSignature: string
}

export type C_DELIVER_MESSAGE = {
    type: 'c-deliver',
    message: string
}
export type C_SEND_MESSAGE = {
    type: 'c-send',
    message: CommandBatch,
    sender: string,
    tag: string
}