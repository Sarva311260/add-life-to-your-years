import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Data ordered top-to-bottom (matplotlib plots bottom-to-top, so we reverse)
# Rank 1 at top = last in list
labels_top_to_bottom = [
    "1. Smoking and\ntobacco use",
    "2. Excessive alcohol\nconsumption",
    "3. Bad diet / excess\ncalorie intake",
    "4. Physical inactivity /\nsedentary lifestyle",
    "5. Poor sleep",
    "6. Chronic stress",
]
scores_top_to_bottom = [9.5, 9.2, 8.1, 7.4, 6.7, 6.0]

# Reverse so matplotlib (bottom-to-top) displays rank 1 at top
labels = labels_top_to_bottom[::-1]
scores = scores_top_to_bottom[::-1]

# Colors (reversed to match)
colors_top_to_bottom = [
    '#5A9E5A',  # green  - tobacco (rank 1)
    '#C0523A',  # dark red/terracotta - alcohol (rank 2, serious)
    '#E8A040',  # orange - bad diet (rank 3)
    '#5B8DB8',  # steel blue - physical inactivity (rank 4)
    '#F0C080',  # light orange - poor sleep (rank 5)
    '#90BCD8',  # light blue - chronic stress (rank 6)
]
colors = colors_top_to_bottom[::-1]

fig, ax = plt.subplots(figsize=(13, 8))
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Draw bars
bars = ax.barh(
    range(len(labels)),
    scores,
    color=colors,
    height=0.62,
    edgecolor='white',
    linewidth=1.5,
    zorder=3,
)

# Add score labels inside bars
for bar, score in zip(bars, scores):
    ax.text(
        score - 0.12,
        bar.get_y() + bar.get_height() / 2,
        f'Relative Impact Score: {score}',
        va='center',
        ha='right',
        fontsize=11.5,
        color='#1a1a1a',
        zorder=4,
    )

# Y-axis labels
ax.set_yticks(range(len(labels)))
ax.set_yticklabels(labels, fontsize=12, ha='right', color='#222222')

# X-axis
ax.set_xlim(0, 10.4)
ax.set_xticks([0, 2, 4, 6, 8, 10])
ax.set_xticklabels(['0', '2', '4', '6', '8', '10'], fontsize=11)
ax.set_xlabel('Relative Impact Score (Arbitrary Scale)', fontsize=12, color='#333333', labelpad=10)

# Grid
ax.xaxis.grid(True, linestyle='--', color='#cccccc', alpha=0.7, zorder=0)
ax.set_axisbelow(True)

# Remove spines
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.tick_params(axis='y', length=0)

# Title
ax.set_title(
    'Top 6 Lifestyle Factors Contributing\nto Chronic Degenerative Diseases',
    fontsize=18,
    fontweight='bold',
    color='#222222',
    pad=20,
    loc='center',
)

plt.tight_layout(pad=1.5)
plt.savefig(
    '/home/ubuntu/wellness-coach-app/book/top_6_lifestyle_factors_updated.png',
    dpi=180,
    bbox_inches='tight',
    facecolor='white',
)
print("Chart saved!")
plt.close()
