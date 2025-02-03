import matplotlib.pyplot as plt

def parse_throughput_file(filepath):
    """
    Parses a throughput file and extracts the number of nodes and corresponding throughput.

    :param filepath: Path to the throughput file.
    :return: A dictionary with "nodes" and "throughput" keys.
    """
    nodes = []
    throughput = []

    with open(filepath, "r") as file:
        for line in file:
            if line.startswith("Total number of nodes:"):
                nodes.append(int(line.split(":")[1].strip()))
            elif line.startswith("Average throughput:"):
                throughput.append(float(line.split(":")[1].strip().split()[0]))

    return {"nodes": nodes, "throughput": throughput}


def plot_throughput_vs_nodes(filepaths, labels, colors, output_file):
    """
    Plots throughput vs number of nodes for multiple datasets.

    :param filepaths: List of file paths to throughput files.
    :param labels: List of labels for the datasets.
    :param colors: List of colors for the datasets.
    :param output_file: File path to save the graph.
    """
    plt.figure(figsize=(10, 6))

    # Process each file and plot its data
    for filepath, label, color in zip(filepaths, labels, colors):
        data = parse_throughput_file(filepath)
        nodes = data["nodes"]
        throughput = data["throughput"]
        plt.plot(nodes, throughput, marker="o", label=label, color=color)

        # # Add data labels to points
        # for x, y in zip(nodes, throughput):
        #     plt.text(x, y, f"({x}, {round(y, 2)})", fontsize=8, ha="center")

    # Titles and labels
    plt.title("Throughput vs Number of Nodes (Comparison)", fontsize=14)
    plt.xlabel("Number of Nodes", fontsize=12)
    plt.ylabel("Throughput (commands per second)", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True)
    plt.tight_layout()

    # Save and show the plot
    plt.savefig(output_file)
    plt.show()


# if __name__ == "__main__":
#     # File paths to your throughput data files
#     filepaths = [
#         "results/throughputExp_cl_alea_bft.txt",
#         "results/throughputExp_cl_grouped_bft_4.txt",
#         "results/throughputExp_cl_grouped_bft_8.txt",
#     ]
#
#     # Labels and colors for datasets
#     labels = ["Alea BFT", "Grouped BFT (GrpSize - 4)", "Grouped BFT (GrpSize - 8)"]
#     colors = ["blue", "green", "red"]
#
#     # File path to save the graph
#     output_file = "results/throughput_vs_nodes_comparison.png"
#
#     # Plot the graph
#     plot_throughput_vs_nodes(filepaths, labels, colors, output_file)

if __name__ == "__main__":
    # File paths to your throughput data files
    filepaths = [
        "results/throughputExp_cl_alea_bft.txt",
        "results/throughputExp_cl_grouped_bft_8.txt",
        "results/throughputExp_cl_grouped_bft_16.txt",
        "results/throughputExp_cl_alea_bft_fault.txt",
        "results/throughputExp_cl_grouped_bft_8_fault.txt",
    ]

    # Labels and colors for datasets
    labels = ["Alea BFT", "Grouped BFT (GrpSize - 8)", "Grouped BFT (GrpSize - 16)",
              "Alea BFT (With Fault)", "Grouped BFT (GrpSize - 8 With Fault)"]
    colors = ["blue", "green", "red", "orange", "purple"]

    # # File paths to your throughput data files
    # filepaths = [
    #     "results/throughputExp_cl_alea_bft.txt",
    #     "results/throughputExp_cl_grouped_bft_8.txt",
    #     "results/throughputExp_cl_grouped_bft_16.txt",
    # ]
    #
    # # Labels and colors for datasets
    # labels = ["Alea BFT", "Grouped BFT (GrpSize - 8)", "Grouped BFT (GrpSize - 16)"]
    # colors = ["blue", "orange", "purple"]

    # File path to save the graph
    output_file = "results/throughput_vs_nodes_comparison_all.png"

    # Plot the graph
    plot_throughput_vs_nodes(filepaths, labels, colors, output_file)
