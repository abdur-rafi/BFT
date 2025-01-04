echo "N : $1 folder: $2"

if [ $# -ne 2 ]; then
    echo "Error: Missing arguments."
    echo "Usage: $0 <N> <folder>"
    exit 1
fi

bash cpLogs.sh $1 $2
docker stack rm bft