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


def calculate_percentage_differences(dataset1, dataset2):
    """
    Calculates percentage differences between two datasets.

    :param dataset1: First dataset (list of delays).
    :param dataset2: Second dataset (list of delays).
    :return: A list of percentage differences, highest difference, and lowest difference.
    """
    percentage_differences = []
    for d1, d2 in zip(dataset1, dataset2):
        diff = abs(d1 - d2)
        percentage_diff = (diff / max(d1, d2)) * 100  # Percentage difference based on larger value
        percentage_differences.append((diff, percentage_diff))

    # Find highest and lowest percentage differences
    highest_diff = max(percentage_differences, key=lambda x: x[1])  # (absolute_diff, percentage_diff)
    lowest_diff = min(percentage_differences, key=lambda x: x[1])  # (absolute_diff, percentage_diff)

    return percentage_differences, highest_diff, lowest_diff


def plot_delay_vs_nodes(filepaths, labels, colors, output_file):
    """
    Plots average delay vs number of nodes for multiple datasets with percentage differences annotated.

    :param filepaths: List of file paths to delay files.
    :param labels: List of labels for the datasets.
    :param colors: List of colors for the datasets.
    :param output_file: File path to save the graph.
    """
    plt.figure(figsize=(10, 6))

    # Load data for all files
    all_data = [parse_delay_file(filepath) for filepath in filepaths]

    # Plot each dataset
    for data, label, color in zip(all_data, labels, colors):
        nodes = data["nodes"]
        delays = data["delay"]
        plt.plot(nodes, delays, marker="o", label=label, color=color)

    # Calculate percentage differences between the first two datasets
    nodes = all_data[0]["nodes"]  # Assuming all datasets have the same nodes
    delays1 = all_data[0]["delay"]
    delays2 = all_data[1]["delay"]
    percentage_differences, highest_diff, lowest_diff = calculate_percentage_differences(delays1, delays2)

    # Get the indices of highest and lowest differences
    highest_index = percentage_differences.index(highest_diff)
    lowest_index = percentage_differences.index(lowest_diff)

    # Annotate highest difference
    plt.annotate(
        f"Highest Diff: {highest_diff[1]:.2f}%",
        xy=(nodes[highest_index], delays1[highest_index]),
        xytext=(nodes[highest_index] + 2, delays1[highest_index] * 1.1),
        arrowprops=dict(facecolor="black", arrowstyle="->"),
        fontsize=10,
    )

    # # Annotate lowest difference
    # plt.annotate(
    #     f"Lowest Diff: {lowest_diff[1]:.2f}%",
    #     xy=(nodes[lowest_index], delays1[lowest_index]),
    #     xytext=(nodes[lowest_index] + 2, delays1[lowest_index] * 1.1),
    #     arrowprops=dict(facecolor="black", arrowstyle="->"),
    #     fontsize=10,
    # )

    # Apply logarithmic scale to y-axis
    plt.yscale("log")

    # Titles and labels
    plt.title("Average Delay vs Number of Nodes (Comparison with Differences)", fontsize=14)
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
#     output_file = "results/delay_vs_nodes_comparison_annotated.png"
#
#     # Plot the graph
#     plot_delay_vs_nodes(filepaths, labels, colors, output_file)

if __name__ == "__main__":
    # File paths to your delay data files
    filepaths = [
        "results/delayExp_cl_alea_bft.txt",
        "results/delayExp_cl_grouped_bft_4.txt",
        "results/delayExp_cl_grouped_bft_8.txt",
        "results/delayExp_cl_grouped_bft_16.txt",
    ]

    # Labels and colors for datasets
    labels = ["Alea BFT", "Grouped BFT (GrpSize - 4)", "Grouped BFT (GrpSize - 8)", "Grouped BFT (GrpSize - 16)"]
    colors = ["red", "green", "orange", "purple"]

    # File path to save the graph
    output_file = "results/delay_vs_nodes_comparison_percentage.png"

    # Plot the graph
    plot_delay_vs_nodes(filepaths, labels, colors, output_file)
