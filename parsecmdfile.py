
folder = 'commandsFile'

ports = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]

# read file and get the first and last non empty lines

def get_first_and_last_non_empty_lines_and_lines_count(file):
    with open(file, 'r') as f:
        lines = f.readlines()
        first = None
        last = None
        for i, line in enumerate(lines):
            if line.strip() != '':
                first = line
                break
        for i, line in enumerate(reversed(lines)):
            if line.strip() != '':
                last = line
                break
        nonEmptyCount = 0
        for line in lines:
            if line.strip() != '':
                nonEmptyCount += 1
    
        return first, last, nonEmptyCount

def main():
    throughputs = []
    for port in ports:
        filename = f"{folder}/commands_{port}.txt"
        first, last, cmdCount = get_first_and_last_non_empty_lines_and_lines_count(filename)
        first = int(first)
        last = int(last)
        cmdCount = int(cmdCount)

        # print(f"Port {port}: first {first}, last {last}, count {cmdCount}")
        delta = (last - first) / 1000
        throughput = (cmdCount - 1) / delta
        # print(f"Port {port}: {throughput} commands per second")
        throughputs.append(throughput)
    
    avgThroughput = sum(throughputs) / len(throughputs)
    print(f"Average throughput: {avgThroughput} commands per second")
        

if __name__ == "__main__":
    main()