import { IGetCompareValue } from "@datastructures-js/priority-queue";
import { ServerInfo } from "../serverInfo";
import { CommandBatch } from "./types";

export const getCommandBatchPrioriy : IGetCompareValue<CommandBatch> = (commandBatch : CommandBatch) => {
    return commandBatch.priority;
}

export function serverIdToIndex(id : string){
    // return parseInt(id);
    return ServerInfo.OWN_GROUP_IDS.indexOf(id);
}
