N=(32 28 24 20 16 12 8 4)
bs=1
tc=32000
fldr=(32 28 24 20 16 12 8 4)
sleep=(15m 15m 15m 12m 12m 12m 8m 8m)


# iterate with index
for i in "${!N[@]}"
do
    # echo "$i=>${N[i]}"
    bash runStartAndEnd.sh ${N[i]} $bs $tc ${fldr[i]} ${sleep[i]}
done