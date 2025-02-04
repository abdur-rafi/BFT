# # N=(32 28 24 20 16 12 8 4)
# N=(32 24 16 8)
# bs=1
# tc=32000
# # fldr=(32 28 24 20 16 12 8 4)
# fldr=(32 28 24 20 16 12 8 4)
# sleep=(15m 15m 15m 12m 12m 12m 8m 8m)


# # iterate with index
# for i in "${!N[@]}"
# do
#     # echo "$i=>${N[i]}"
#     bash runStartAndEnd.sh ${N[i]} $bs $tc ${fldr[i]} ${sleep[i]}
# done

# bash runStartAndEnd.sh 16 1 32000 5 0 ./logsNew/alea_16/r1 7m
# bash runStartAndEnd.sh 16 1 32000 5 0 ./logsNew/alea_16/r2 7m
# bash runStartAndEnd.sh 16 1 32000 5 0 ./logsNew/alea_16/r3 7m
# # sleep 10s
# bash runStartAndEnd.sh 24 1 32000 7 0 ./logsNew/alea_24/r1 15m
# sleep 10s
# bash runStartAndEnd.sh 24 1 32000 7 0 ./logsNew/alea_24/r2 15m
# sleep 10s
# bash runStartAndEnd.sh 24 1 32000 7 0 ./logsNew/alea_24/r3 15m


# bash runStartAndEnd.sh 32 1 32000 10 0 ./logsNew/alea_32/r1 15m
# sleep 10s
# bash runStartAndEnd.sh 32 1 32000 10 0 ./logsNew/alea_32/r2 15m
# sleep 10s
# bash runStartAndEnd.sh 32 1 32000 10 0 ./logsNew/alea_32/r3 15m


# bash runStartAndEnd.sh 32 1 32000 8 1 ./logsNew/alea_32_f/r1 15m
# sleep 10s
# bash runStartAndEnd.sh 32 1 32000 8 1 ./logsNew/alea_32_f/r2 15m
# sleep 10s
# bash runStartAndEnd.sh 32 1 32000 8 1 ./logsNew/alea_32_f/r3 15m


# bash runStartAndEnd.sh 24 1 32000 6 1 ./logsNew/alea_24_f/r1 15m
# sleep 10s
# bash runStartAndEnd.sh 24 1 32000 6 1 ./logsNew/alea_24_f/r2 15m
# sleep 10s
# bash runStartAndEnd.sh 24 1 32000 6 1 ./logsNew/alea_24_f/r3 15m

N=16
T=4
BS=128
F=0
for i in {1..3}; do
    bash runStartAndEnd.sh $N $BS 32000 $T $F ./logsNew/alea_${N}_bs_${BS}/r${i} 5m
    sleep 10s
done
