import matplotlib.pyplot as plt

def parse_delay_file(filepath):
    """
    Parses a delay file and extracts the number of batchSize and corresponding average delay.

    :param filepath: Path to the delay file.
    :return: A dictionary with "batchSize" and "delay" keys.
    """
    batchSize = []
    delays = []

    with open(filepath, "r") as file:
        for line in file:
            if line.startswith("Batch size:"):
                batchSize.append(int(line.split(":")[1].strip()))
            elif line.startswith("Average Delay:"):
                delays.append(float(line.split(":")[1].strip().split()[0]))

    return {"batchSize": batchSize, "delay": delays}


def plot_delay_vs_batchSize(filepaths, labels, colors, output_file):
    """
    Plots average delay vs number of batchSize for multiple datasets.

    :param filepaths: List of file paths to delay files.
    :param labels: List of labels for the datasets.
    :param colors: List of colors for the datasets.
    :param output_file: File path to save the graph.
    """
    plt.figure(figsize=(10, 6))

    # Process each file and plot its data
    for filepath, label, color in zip(filepaths, labels, colors):
        data = parse_delay_file(filepath)
        batchSize = data["batchSize"]
        delays = data["delay"]
        plt.plot(batchSize, delays, marker="o", label=label, color=color)

    # Apply logarithmic scale to y-axis
    plt.yscale("log")

    # Titles and labels
    plt.title("Average Delay vs Number of batchSize (Comparison)", fontsize=14)
    plt.xlabel("Number of batchSize", fontsize=12)
    plt.ylabel("Average Delay (s)", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True)
    plt.tight_layout()

    # Save and show the plot
    plt.savefig(output_file)
    plt.show()


if __name__ == "__main__":
    # File paths to your delay data files
    filepaths = [
        "results/delayExpBt_cl_alea_bft.txt",
        "results/delayExpBt_cl_grouped_bft_8.txt",
    ]

    # Labels and colors for datasets
    labels = ["Alea BFT", "Grouped BFT (GrpSize - 8)"]
    colors = ["orange", "green"]

    # File path to save the graph
    output_file = "results/delay_vs_batchSize_comparison.png"

    # Plot the graph
    plot_delay_vs_batchSize(filepaths, labels, colors, output_file)
