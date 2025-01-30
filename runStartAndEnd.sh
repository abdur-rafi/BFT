N=$1
bs=$2
commandCount=$3
t=$4
malice=$5
fldr=$6
sleep=$7

if [ $# -ne 7 ]; then
    echo $#
    echo "Error: Missing arguments."
    echo "Usage: $0 <N> <bs> <commandCount> <t> <malice> <folder> <sleep>"
    exit 1
fi

bash startExp.sh $N $bs $commandCount $t $malice
sleep $sleep
bash endExp.sh $N $fldr
