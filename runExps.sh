#!/bin/bash

run_experiment() {
    local N=$1
    local BS=$2
    local GS=$3
    local T=$4
    local F=$5
    local run_label=$6

    echo "Starting experiment with parameters: N=$N, BS=$BS, GS=$GS, T=$T, F=$F, Run Label=$run_label"
    bash startExp.sh $N $BS 32000 $GS $T $F
    sleep 4m
    bash endExp.sh $N ./logs_new/grouped_bft_${N}_gs_16/$run_label
    sleep 10s
}

main() {
    local N=$1
    local BS=$2
    local F=$3
    local T=$4
    local GS=$5

    for i in {1..3}; do
        run_label="r$i"
        run_experiment $N $BS $GS $T $F $run_label
    done
}

# Example usage:
# N=16
# BS=1
# F=0
# T=4
# GS=8

# main $N $BS $F $T $GS
# main 8 1 0 2 8 
# main 16 1 0 2 8 
# sleep 10s
# main 24 1 0 2 8 
# main 32 1 0 2 8 
# main 16 1 0 4 16 
main 32 1 0 4 16 
