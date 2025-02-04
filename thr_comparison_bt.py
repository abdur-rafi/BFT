import matplotlib.pyplot as plt

def parse_throughput_file(filepath):
    """
    Parses a throughput file and extracts the number of batchSize and corresponding throughput.

    :param filepath: Path to the throughput file.
    :return: A dictionary with "batchSize" and "throughput" keys.
    """
    batchSize = []
    throughput = []

    with open(filepath, "r") as file:
        for line in file:
            if line.startswith("Batch size:"):
                batchSize.append(int(line.split(":")[1].strip()))
            elif line.startswith("Average throughput:"):
                throughput.append(float(line.split(":")[1].strip().split()[0]))

    return {"batchSize": batchSize, "throughput": throughput}


def plot_throughput_vs_Bt(filepaths, labels, colors, output_file):
    """
    Plots throughput vs number of batchSize for multiple datasets.

    :param filepaths: List of file paths to throughput files.
    :param labels: List of labels for the datasets.
    :param colors: List of colors for the datasets.
    :param output_file: File path to save the graph.
    """
    plt.figure(figsize=(10, 6))

    # Process each file and plot its data
    for filepath, label, color in zip(filepaths, labels, colors):
        data = parse_throughput_file(filepath)
        batchSize = data["batchSize"]
        throughput = data["throughput"]
        plt.plot(batchSize, throughput, marker="o", label=label, color=color)

        # # Add data labels to points
        # for x, y in zip(batchSize, throughput):
        #     plt.text(x, y, f"({x}, {round(y, 2)})", fontsize=8, ha="center")

    # Titles and labels
    plt.title("Throughput vs Batch Size (Comparison)", fontsize=14)
    plt.xlabel("Batch Size", fontsize=12)
    plt.ylabel("Throughput (commands per second)", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True)
    plt.tight_layout()

    # Save and show the plot
    plt.savefig(output_file)
    plt.show()


if __name__ == "__main__":
    # File paths to your throughput data files
    filepaths = [
        "results/throughputExpBt_cl_alea_bft.txt",
        "results/throughputExpBt_cl_grouped_bft_8.txt",
    ]

    # Labels and colors for datasets
    labels = ["Alea BFT", "Hierarchical BFT (GrpSize - 8)"]
    colors = ["blue", "green"]

    # File path to save the graph
    output_file = "results/throughput_vs_batchsize_comparison.png"

    # Plot the graph
    plot_throughput_vs_Bt(filepaths, labels, colors, output_file)
