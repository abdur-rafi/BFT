import matplotlib.pyplot as plt

def parse_throughput_file(filepath):
    """
    Parses a throughput file and extracts the number of nodes and corresponding throughput.

    :param filepath: Path to the throughput file.
    :return: A dictionary with "nodes" and "throughput" keys.
    """
    nodes = []
    throughputs = []

    with open(filepath, "r") as file:
        for line in file:
            if line.startswith("Total number of nodes:"):
                nodes.append(int(line.split(":")[1].strip()))
            elif line.startswith("Average throughput:"):
                throughputs.append(float(line.split(":")[1].strip().split()[0]))

    return {"nodes": nodes, "throughput": throughputs}


def calculate_percentage_contributions_relative_to_alea(alea_data, other_data):
    """
    Calculates percentage contributions of absolute differences relative to Alea BFT values,
    considering only nodes present in both datasets.

    :param alea_data: Dictionary with "nodes" and "throughput" for Alea BFT.
    :param other_data: Dictionary with "nodes" and "throughput" for the group being compared.
    :return: List of percentage contributions and the corresponding indices for Alea and Other.
    """
    alea_nodes = alea_data["nodes"]
    alea_throughput = alea_data["throughput"]
    other_nodes = other_data["nodes"]
    other_throughput = other_data["throughput"]

    # Find common nodes between Alea and the other group
    common_nodes = set(alea_nodes).intersection(other_nodes)

    # Calculate percentage contributions for common nodes
    percentage_contributions = []
    alea_indices = []
    other_indices = []
    for node in common_nodes:
        alea_index = alea_nodes.index(node)
        other_index = other_nodes.index(node)
        alea_value = alea_throughput[alea_index]
        other_value = other_throughput[other_index]
        percentage_diff = (abs(other_value - alea_value) / alea_value) * 100
        percentage_contributions.append(percentage_diff)
        alea_indices.append(alea_index)  # Indices relative to Alea's nodes
        other_indices.append(other_index)  # Indices relative to Other's nodes

    return percentage_contributions, alea_indices, other_indices


def plot_throughput_vs_nodes(filepaths, labels, colors, output_file):
    """
    Plots average throughput vs number of nodes for multiple datasets with highest percentage contributions annotated.

    :param filepaths: List of file paths to throughput files.
    :param labels: List of labels for the datasets.
    :param colors: List of colors for the datasets.
    :param output_file: File path to save the graph.
    """
    plt.figure(figsize=(10, 6))

    # Load data for all files
    all_data = [parse_throughput_file(filepath) for filepath in filepaths]

    # Plot each dataset
    for data, label, color in zip(all_data, labels, colors):
        nodes = data["nodes"]
        throughputs = data["throughput"]
        plt.plot(nodes, throughputs, marker="o", label=label, color=color)

    # Calculate percentage contributions relative to Alea BFT, considering only common nodes
    alea_data = all_data[0]
    grp_bft_4_data = all_data[1]
    grp_bft_8_data = all_data[2]

    perc_contrib_grp4, alea_indices_grp4, grp4_indices = calculate_percentage_contributions_relative_to_alea(
        alea_data, grp_bft_4_data
    )
    perc_contrib_grp8, alea_indices_grp8, grp8_indices = calculate_percentage_contributions_relative_to_alea(
        alea_data, grp_bft_8_data
    )

    # Find the highest percentage contribution for GrpSize 4 (excluding initial nodes)
    highest_grp4_idx = perc_contrib_grp4.index(max(perc_contrib_grp4))
    alea_grp4_node = alea_data["nodes"][alea_indices_grp4[highest_grp4_idx]]
    grp4_value = grp_bft_4_data["throughput"][grp4_indices[highest_grp4_idx]]
    plt.annotate(
        f"Grp4 High: {max(perc_contrib_grp4):.2f}%",
        xy=(alea_grp4_node, grp4_value),
        xytext=(alea_grp4_node + 1, grp4_value * 1.1),
        arrowprops=dict(facecolor="orange", arrowstyle="->"),
        fontsize=10,
    )

    # Find the highest percentage contribution for GrpSize 8 (excluding initial nodes)
    highest_grp8_idx = perc_contrib_grp8.index(max(perc_contrib_grp8))
    alea_grp8_node = alea_data["nodes"][alea_indices_grp8[highest_grp8_idx]]
    grp8_value = grp_bft_8_data["throughput"][grp8_indices[highest_grp8_idx]]
    plt.annotate(
        f"Grp8 High: {max(perc_contrib_grp8):.2f}%",
        xy=(alea_grp8_node, grp8_value),
        xytext=(alea_grp8_node + 1, grp8_value * 1.1),
        arrowprops=dict(facecolor="green", arrowstyle="->"),
        fontsize=10,
    )

    # Titles and labels
    plt.title("Average Throughput vs Number of Nodes", fontsize=14)
    plt.xlabel("Number of Nodes", fontsize=12)
    plt.ylabel("Average Throughput (commands per second)", fontsize=12)
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
#     colors = ["red", "orange", "green"]
#
#     # File path to save the graph
#     output_file = "results/throughput_vs_nodes_%_comparison.png"
#
#     # Plot the graph
#     plot_throughput_vs_nodes(filepaths, labels, colors, output_file)

if __name__ == "__main__":
    # File paths to your throughput data files
    filepaths = [
        "results/throughputExp_cl_alea_bft_fault.txt",
        "results/throughputExp_cl_grouped_bft_8_fault.txt",
    ]

    # Labels and colors for datasets
    labels = ["Alea BFT (With Fault)", "Grouped BFT (GrpSize - 8 With Fault)"]
    colors = ["red", "orange", "green"]

    # File path to save the graph
    output_file = "results/throughput_vs_nodes_%_comparison_fault.png"

    # Plot the graph
    plot_throughput_vs_nodes(filepaths, labels, colors, output_file)
