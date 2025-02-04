import matplotlib.pyplot as plt

def parse_delay_file(filepath):
    """
    Parses a delay file and extracts the number of nodes and corresponding average delay.

    :param filepath: Path to the delay file.
    :return: A dictionary with "nodes" and "delay" keys.
    """
    nodes = []
    delays = []

    with open(filepath, "r") as file:
        for line in file:
            if line.startswith("Total number of nodes:"):
                nodes.append(int(line.split(":")[1].strip()))
            elif line.startswith("Average Delay:"):
                delays.append(float(line.split(":")[1].strip().split()[0]))

    return {"nodes": nodes, "delay": delays}


def plot_delay_vs_nodes(filepaths, labels, colors, output_file):
    """
    Plots average delay vs number of nodes for multiple datasets.

    :param filepaths: List of file paths to delay files.
    :param labels: List of labels for the datasets.
    :param colors: List of colors for the datasets.
    :param output_file: File path to save the graph.
    """
    plt.figure(figsize=(10, 6))

    # Process each file and plot its data
    for filepath, label, color in zip(filepaths, labels, colors):
        data = parse_delay_file(filepath)
        nodes = data["nodes"]
        delays = data["delay"]
        plt.plot(nodes, delays, marker="o", label=label, color=color)

    # Apply logarithmic scale to y-axis
    plt.yscale("log")

    # Titles and labels
    plt.title("Average Delay vs Number of Nodes (Comparison)", fontsize=14)
    plt.xlabel("Number of Nodes", fontsize=12)
    plt.ylabel("Average Delay (s)", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True)
    plt.tight_layout()

    # Save and show the plot
    plt.savefig(output_file)
    plt.show()


# if __name__ == "__main__":
#     # File paths to your delay data files
#     filepaths = [
#         "results/delayExp_cl_alea_bft.txt",
#         "results/delayExp_cl_grouped_bft_4.txt",
#         "results/delayExp_cl_grouped_bft_8.txt",
#     ]
#
#     # Labels and colors for datasets
#     labels = ["Alea BFT", "Grouped BFT (GrpSize - 4)", "Grouped BFT (GrpSize - 8)"]
#     colors = ["red", "orange", "green"]
#
#     # File path to save the graph
#     output_file = "results/delay_vs_nodes_comparison.png"
#
#     # Plot the graph
#     plot_delay_vs_nodes(filepaths, labels, colors, output_file)

if __name__ == "__main__":
    # # File paths to your delay data files
    # filepaths = [
    #     "results/delayExp_cl_alea_bft.txt",
    #     "results/delayExp_cl_grouped_bft_8.txt",
    #     "results/delayExp_cl_grouped_bft_16.txt",
    #     "results/delayExp_cl_alea_bft_fault.txt",
    #     "results/delayExp_cl_grouped_bft_8_fault.txt",
    # ]
    #
    # # Labels and colors for datasets
    # labels = ["Alea BFT", "Hierarchical BFT (GrpSize - 8)", "Hierarchical BFT (GrpSize - 16)",
    #           "Alea BFT (With Fault)", "Hierarchical BFT (GrpSize - 8 With Fault)"]
    # colors = ["red", "orange", "green", "blue", "purple"]

    # File paths to your delay data files
    filepaths = [
        "results/delayExp_cl_alea_bft.txt",
        "results/delayExp_cl_grouped_bft_8.txt",
        "results/delayExp_cl_grouped_bft_16.txt",
    ]

    # Labels and colors for datasets
    labels = ["Alea BFT", "Hierarchical BFT (GrpSize - 8)", "Hierarchical BFT (GrpSize - 16)"]
    colors = ["red", "green", "orange"]

    # File path to save the graph
    output_file = "results/delay_vs_nodes_comparison_no_fault.png"

    # Plot the graph
    plot_delay_vs_nodes(filepaths, labels, colors, output_file)
