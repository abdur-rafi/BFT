import { ServerInfo } from "../serverInfo";
import { CommandBatch } from "./types";
import fs from 'fs';

export class ExecuteCommand{
    public executedCommands : Set<string>;
    public file : number;
    public executeAfterCompletion : Map<string, ()=>void>;

    constructor(){
        this.executedCommands = new Set();
        // open a file to write
        this.file = fs.openSync('commands.txt', 'w');
        this.executeAfterCompletion = new Map();
        // fs.writeSync(this.file, `${new Date().getTime()}\n`);
        // fs.writeSync(this.file, `Started at ${new Date().toString()}\n`);
    }
    
    public isExecuted(m : CommandBatch['commands'][0]){
        return this.executedCommands.has(m.id);
    }

    public executeIfNotAlready(m : CommandBatch['commands'][0]){
        if(!this.executedCommands.has(m.id)){
            // console.log(`Executing command with id ${m.id} in server ${ServerInfo.OWN_ID}`);
            console.log(`Executing ${this.executedCommands.size + 1}th command: ${m.id} ${Date.now()}`);
            // write to file
            fs.writeSync(this.file, `Executing command ${m.id}\n`);
            // fs.writeSync(this.file, `${new Date().getTime()}\n`);
            // fs.writeSync(this.file, `Executing command ${m.id} at ${new Date().toString()}\n`);
            this.executedCommands.add(m.id);
            if(this.executeAfterCompletion.has(m.id)){
                this.executeAfterCompletion.get(m.id)!();
                // this.executeAfterCompletion.delete(m.id);
            }
        }
    }

    public flush(){
        // flush the content
        fs.closeSync(this.file);
    }
}