N=$1
bs=$2
tc=$3
fldr=$4
sleep=$5

if [ $# -ne 5 ]; then
    echo "Error: Missing arguments."
    echo "Usage: $0 <N> <bs> <tc> <folder> <sleep>"
    exit 1
fi

bash startExp.sh $N $bs $tc
sleep $sleep
bash endExp.sh $N $fldr