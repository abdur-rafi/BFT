# create bash array from these values :  512, 481, 444, 418, 523, 480, 517, 545, 510, 460, 431, 441, 486, 474, 421, 476
arr=(481 444 418 523 480 517 545 510 460 431 441 486 474 421 476)

# iterate through array
for i in "${arr[@]}"
do
    bash setupVm_cloudlab.sh $i
done

