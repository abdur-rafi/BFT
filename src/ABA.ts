import { BvStore } from "./BvBroadcast";

class ABA{

    private est:boolean;
    private roundNo : number;


    constructor(binValue: boolean){
        this.est = binValue;    
        this.roundNo = 0;
    }

    public oneRound(){
        this.roundNo++;
        // BvStore.startBvBroadcast(this.roundNo.toString(), this.est);
    }
}