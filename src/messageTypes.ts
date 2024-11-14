export const MessageType = {
    SERVER_ID : "SERVER_ID",
    BV_BROADCAST : "BV_BROADCAST",
    READY : "READY",
    AUX : "AUX"
}

export type BV_BROADCAST_MESSAGE = {
    id: string,
    value: boolean,
    serverId: string
}

export type READY_MESSAGE = {
    serverId: string
}

export type AUX_MESSAGE = {
    abaId : string,
    roundNo : number,
    serverId: string,
    binValue: boolean
}
