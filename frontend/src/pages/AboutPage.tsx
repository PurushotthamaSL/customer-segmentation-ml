import React, { useState } from 'react';
import {
  Info,
  Cpu,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: '1. Why is K-Means clustering classified as an Unsupervised Learning algorithm?',
      a: 'Unsupervised learning deals with unlabeled training data. In customer segmentation, we do not possess ground-truth category labels (e.g. "Cluster 1" or "VIP"). K-Means discovers latent geometric structures and groupings purely through Euclidean distance minimization without supervision.'
    },
    {
      q: '2. Why is feature scaling (StandardScaler) necessary before running K-Means?',
      a: 'K-Means is a distance-based algorithm using Euclidean metric: d(p, q) = sqrt(sum((p_i - q_i)^2)). In the Mall Customers dataset, Annual Income ranges from 15 to 137 ($k), while Spending Score ranges from 1 to 100. If one feature has higher variance or larger scale, it disproportionately dominates the distance metric. StandardScaler transforms features to mean=0 and variance=1 (Z-scores), giving each dimension equal mathematical weight.'
    },
    {
      q: '3. What is Inertia, and how does the Elbow Method assist in selecting K?',
      a: 'Inertia (Within-Cluster Sum of Squares, WCSS) measures internal cluster compactness: sum_{i=1}^K sum_{x in C_i} ||x - mu_i||^2. As K increases toward the sample size N, inertia monotonically decreases to zero. The Elbow Method identifies the point of inflection where the rate of decrease abruptly flattens, representing optimal compactness without over-partitioning.'
    },
    {
      q: '4. What is the Silhouette Score, and what do its values signify?',
      a: 'The Silhouette Score s(i) = (b(i) - a(i)) / max(a(i), b(i)) measures both cohesion (mean intra-cluster distance a(i)) and separation (mean nearest-cluster distance b(i)). Values range from -1.0 to +1.0. A score near +1.0 indicates well-separated, dense clusters; ~0.0 indicates overlapping boundaries; negative values imply points assigned to the wrong cluster.'
    },
    {
      q: '5. Why are the segment names (e.g. "High-Value Champions") not directly produced by K-Means?',
      a: 'K-Means produces only mathematical cluster IDs (0, 1, 2, ...). It possesses no semantic domain awareness. In CustomerLens AI, we calculate the statistical centroids and medians of each cluster, compare them to the population mean, and map them to business interpretations using transparent rule-based logic. This allows marketers to rename clusters according to business terminology.'
    },
    {
      q: '6. How does Lloyd\'s algorithm converge to cluster centers?',
      a: 'Lloyd\'s algorithm alternates between two steps: (1) Assignment Step: Assign each sample point to the nearest centroid using Euclidean distance. (2) Update Step: Recompute each centroid as the arithmetic mean of all points assigned to that cluster. It iterates until centroids stabilize within a tolerance threshold (tol=1e-4) or max_iter is reached.'
    },
    {
      q: '7. What are the key limitations of K-Means clustering in real-world retail?',
      a: 'K-Means assumes spherical clusters of equal variance and is sensitive to outliers and random initialization (mitigated by K-Means++ and multiple n_init runs). For non-spherical or density-varying customer distributions, algorithms like DBSCAN or Gaussian Mixture Models (GMM) can be considered.'
    },
    {
      q: '8. How does CustomerLens AI convert clustering outputs into actionable business value?',
      a: 'Rather than stopping at a scatter plot, CustomerLens AI computes segment-specific strategies: High Income + High Spending customers receive VIP loyalty retention playbooks; High Income + Low Spending customers receive luxury activation campaigns; price-sensitive groups receive discount bundles. This translates raw ML output directly into commercial revenue strategies.'
    }
  ];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          Project Architecture & Academic Viva Guide
        </h2>
        <p className="text-xs text-lavender mt-0.5">
          System architecture, mathematical foundations, and final-year AIML viva exam preparation
        </p>
      </div>

      {/* Problem Statement & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-3">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Problem Statement
          </span>
          <h3 className="text-lg font-bold text-white">The Limitation of Manual Retail Analysis</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Traditional retail enterprises rely on coarse demographic buckets or static spreadsheets to segment customers.
            This manual approach overlooks multidimensional behavioral patterns, fails to account for non-linear spending tendencies,
            and leads to generic marketing campaigns that dilute brand equity and waste promotional budget.
          </p>
          <ul className="text-xs text-lavender space-y-1.5 pt-2">
            <li className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">&#10005;</span> High manual latency and human cognitive bias
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">&#10005;</span> Inability to discover complex behavioral clusters
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">&#10005;</span> One-size-fits-all promotions with low conversion
            </li>
          </ul>
        </div>

        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-3 border-purple-500/30">
          <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
            Proposed Solution
          </span>
          <h3 className="text-lg font-bold text-white">Unsupervised Machine Learning with Actionable AI</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            CustomerLens AI applies Scikit-learn K-Means clustering with feature standardization to partition customer
            records geometrically. It evaluates cluster validity using Inertia and Silhouette metrics, maps cluster centroids
            to dynamic business profiles, and prescribes transparent, omnichannel marketing playbooks.
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
            <li className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mathematical segmentation via distance minimization
            </li>
            <li className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Real-time Elbow Method & Silhouette validation
            </li>
            <li className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic, transparent business intelligence rules
            </li>
          </ul>
        </div>
      </div>

      {/* System Architecture Pipeline Visual */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          End-to-End System Architecture Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lavender uppercase">Stage 1</span>
              <h4 className="font-bold text-xs text-white">Data Ingestion</h4>
              <p className="text-[11px] text-lavender mt-1">
                Kaggle Mall Customers CSV loaded via Pandas; missing values and duplicate records audited.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-300 mt-3 font-semibold">Pandas / FastAPI</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lavender uppercase">Stage 2</span>
              <h4 className="font-bold text-xs text-white">Preprocessing</h4>
              <p className="text-[11px] text-lavender mt-1">
                StandardScaler computes Z-score normalization for selected numerical dimensions.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 mt-3 font-semibold">StandardScaler</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lavender uppercase">Stage 3</span>
              <h4 className="font-bold text-xs text-white">K-Means Engine</h4>
              <p className="text-[11px] text-lavender mt-1">
                K-Means partitions data into K clusters; computes centroids and internal inertia.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 mt-3 font-semibold">Scikit-learn / Joblib</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lavender uppercase">Stage 4</span>
              <h4 className="font-bold text-xs text-white">Model Evaluation</h4>
              <p className="text-[11px] text-lavender mt-1">
                Elbow curve (Inertia SSE) and Silhouette coefficients calculated across K=2..10.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-300 mt-3 font-semibold">Silhouette / WCSS</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lavender uppercase">Stage 5</span>
              <h4 className="font-bold text-xs text-white">Insights & UI</h4>
              <p className="text-[11px] text-lavender mt-1">
                Interactive Glassmorphism dashboard with Recharts, custom labels, and CSV export.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 mt-3 font-semibold">React / Recharts</span>
          </div>
        </div>
      </div>

      {/* Academic Viva Questions Accordion */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              AIML Academic Viva Voce Examination Q&A Guide
            </h3>
            <p className="text-xs text-lavender mt-0.5">
              High-yield technical answers tailored for university external project evaluation
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-white hover:text-purple-300 transition"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-lavender shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/[0.06] bg-[#080B18]/60">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
