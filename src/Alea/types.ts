
export const AgreementComponentMessageType = {
    FILL_GAP : "FILL_GAP",
    FILLER : "FILLER",
    ABA_RESULT : "ABA_RESULT"
}

export type FILL_GAP_MESSAGE = {
    requestedFor : string;
    lastPriority : number;
    requestedBy : string;
    roundNo : number;
}


export type FILLER_MESSAGE = {
    sentFrom : string;
    requestedFor : string;
    requestedBy : string;
    commandBatches : CommandBatch[]
}


export type ClientCommand = {
    id : string;
    command : string;
}

export type CommandBatch = {
    id : string;
    priority : number;
    commands : ClientCommand[];
    createdFrom : string;
}

export type ABA_Result = {
    groupId : number;
    roundNo : number;
    result : boolean;
    serverId : string;
    commandBatch : CommandBatch | null;
}