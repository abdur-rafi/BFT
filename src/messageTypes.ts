export const MessageType = {
    SERVER_ID : "SERVER_ID",
    BV_BROADCAST : "BV_BROADCAST",
    READY : "READY"
}

export type BV_BROADCAST_MESSAGE = {
    id: string,
    value: boolean,
    serverId: string
}

export type READY_MESSAGE = {
    serverId: string
}