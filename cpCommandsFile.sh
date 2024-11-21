# ports array from 3002 to 3005
ports=(3002 3003 3004 3005)
# loop through the ports array
for port in "${ports[@]}"
do
  # copy the commands file to the container
  docker cp bft_server_${port}:/app/commands.txt ./commandsFile/commands_${port}.txt
done

# nested loop to check if any of the commands files are different
for port in "${ports[@]}"
do
  for port2 in "${ports[@]}"
  do
    # check if the files are different
    if ! cmp -s ./commandsFile/commands_${port}.txt ./commandsFile/commands_${port2}.txt
    then
      echo "commands_${port}.txt and commands_${port2}.txt are different"
    fi
  done
done