import os
import json
import datetime
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import joblib

from app.config import (
    MODEL_SAVE_PATH,
    METADATA_SAVE_PATH,
    DEFAULT_FEATURES,
    DEFAULT_CLUSTERS,
    RANDOM_STATE
)
from app.services.data_service import DataService

CLUSTER_PALETTE = [
    "#8B5CF6",  # Purple
    "#06B6D4",  # Cyan
    "#10B981",  # Emerald Green
    "#F59E0B",  # Amber
    "#EC4899",  # Pink
    "#3B82F6",  # Blue
    "#F97316",  # Orange
    "#14B8A6",  # Teal
    "#6366F1",  # Indigo
    "#E11D48",  # Rose
]

class MLService:
    def __init__(self, data_service: DataService):
        self.data_service = data_service
        self.model: Optional[KMeans] = None
        self.scaler: Optional[StandardScaler] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.clustered_df: Optional[pd.DataFrame] = None
        self.custom_labels: Dict[int, str] = {}
        self._try_load_saved_model()

    def _try_load_saved_model(self) -> None:
        """Attempt to restore fitted model and metadata from disk."""
        if MODEL_SAVE_PATH.exists() and METADATA_SAVE_PATH.exists():
            try:
                saved_bundle = joblib.load(MODEL_SAVE_PATH)
                self.model = saved_bundle.get("model")
                self.scaler = saved_bundle.get("scaler")
                with open(METADATA_SAVE_PATH, "r") as f:
                    self.metadata = json.load(f)
                self.custom_labels = self.metadata.get("custom_labels", {})
                # Re-generate clustered dataframe
                if self.data_service.is_dataset_available():
                    self._apply_clustering_to_dataset()
            except Exception as e:
                print(f"[MLService] Could not restore saved model: {e}")
                self.model = None

    def _apply_clustering_to_dataset(self) -> None:
        """Applies currently fitted model to full dataset."""
        if self.model is None or self.metadata is None:
            return

        df = self.data_service.get_raw_dataframe().copy()
        features = self.metadata.get("features", DEFAULT_FEATURES)
        use_scaler = self.metadata.get("use_scaler", True)

        X = self._prepare_features(df, features)
        if use_scaler and self.scaler is not None:
            X_scaled = self.scaler.transform(X)
            labels = self.model.predict(X_scaled)
        else:
            labels = self.model.predict(X)

        df["cluster"] = labels

        # Map cluster ID to label
        cluster_profiles = self.metadata.get("clusters", [])
        label_map = {
            cp["cluster_id"]: self.custom_labels.get(cp["cluster_id"], cp.get("label", f"Cluster {cp['cluster_id']}"))
            for cp in cluster_profiles
        }
        df["segment_label"] = df["cluster"].map(label_map)
        self.clustered_df = df

    def _prepare_features(self, df: pd.DataFrame, features: List[str]) -> np.ndarray:
        """Extract and optionally encode features for clustering."""
        X_df = pd.DataFrame()
        for f in features:
            if f not in df.columns:
                raise ValueError(f"Feature '{f}' does not exist in dataset.")
            if f.lower() == "gender":
                # Binary encode Male=1, Female=0
                X_df[f] = df[f].map({"Male": 1, "Female": 0, "male": 1, "female": 0}).fillna(0)
            else:
                X_df[f] = pd.to_numeric(df[f], errors="coerce").fillna(df[f].median() if not df[f].empty else 0)
        return X_df.values

    def _derive_dynamic_segment_label(
        self,
        cluster_means: Dict[str, float],
        global_means: Dict[str, float],
        cluster_id: int
    ) -> Tuple[str, List[str], str]:
        """
        Dynamically derives interpretable business labels and strategies
        based on cluster feature averages compared to global averages.
        Never hardcodes labels to cluster IDs.
        """
        # Find income and spending columns
        income_key = next((k for k in cluster_means if "income" in k.lower()), None)
        spending_key = next((k for k in cluster_means if "spending" in k.lower() or "score" in k.lower()), None)
        age_key = next((k for k in cluster_means if "age" in k.lower()), None)

        c_inc = cluster_means.get(income_key, 50.0) if income_key else 50.0
        g_inc = global_means.get(income_key, 50.0) if income_key else 50.0

        c_spd = cluster_means.get(spending_key, 50.0) if spending_key else 50.0
        g_spd = global_means.get(spending_key, 50.0) if spending_key else 50.0

        c_age = cluster_means.get(age_key, 38.0) if age_key else 38.0
        g_age = global_means.get(age_key, 38.0) if age_key else 38.0

        is_high_income = c_inc > (g_inc * 1.08)
        is_low_income = c_inc < (g_inc * 0.92)
        is_high_spend = c_spd > (g_spd * 1.08)
        is_low_spend = c_spd < (g_spd * 0.92)

        characteristics = []
        if income_key:
            pct_inc_diff = round(((c_inc - g_inc) / max(g_inc, 1)) * 100, 1)
            sign = "+" if pct_inc_diff >= 0 else ""
            characteristics.append(f"Income: {sign}{pct_inc_diff}% vs global average (${c_inc:.1f}k)")
        if spending_key:
            pct_spd_diff = round(((c_spd - g_spd) / max(g_spd, 1)) * 100, 1)
            sign = "+" if pct_spd_diff >= 0 else ""
            characteristics.append(f"Spending Score: {sign}{pct_spd_diff}% vs average ({c_spd:.1f}/100)")
        if age_key:
            characteristics.append(f"Average Age: {c_age:.1f} years (Global avg: {g_age:.1f})")

        # Business Rule Mapping
        if is_high_income and is_high_spend:
            label = "High-Value Champions"
            strategy = (
                "Provide VIP loyalty privileges, exclusive early access to premium collections, concierge services, "
                "and invitation-only brand experiences."
            )
        elif is_high_income and is_low_spend:
            label = "Affluent Opportunity / Savers"
            strategy = (
                "Deploy targeted engagement campaigns, high-end product showcases, personalized value propositions, "
                "and luxury experience bundles to activate their high purchasing potential."
            )
        elif is_low_income and is_high_spend:
            label = "Impulsive Spenders / Youth Trendsetters"
            strategy = (
                "Offer flexible BNPL (Buy Now Pay Later) payment solutions, trendy youth-oriented micro-promotions, "
                "and referral rewards to maximize repeat engagement without inducing budget fatigue."
            )
        elif is_low_income and is_low_spend:
            label = "Budget-Conscious Savers"
            strategy = (
                "Highlight value-first discounts, essentials coupons, seasonal clearance deals, and clear price-to-utility promotions."
            )
        elif is_high_spend:
            label = "Active Spenders"
            strategy = "Nurture with points accelerators, limited-time flash sales, and product recommendations."
        elif is_low_spend:
            label = "Careful Savers"
            strategy = "Re-engage through low-friction introductory offers and seasonal holiday promotions."
        else:
            label = "Mainstream Regulars"
            strategy = (
                "Maintain steady relationship with tiered loyalty points, cross-category recommendations, "
                "and standard seasonal marketing campaigns."
            )

        return label, characteristics, strategy

    def train_kmeans(
        self,
        features: Optional[List[str]] = None,
        n_clusters: int = DEFAULT_CLUSTERS,
        use_scaler: bool = True,
        random_state: int = RANDOM_STATE,
        n_init: int = 10
    ) -> Dict[str, Any]:
        """
        Fits real Scikit-learn K-Means model on the dataset with optional StandardScaler.
        Calculates inertia, silhouette score, centroids, dynamic segment profiles, and persists the model.
        """
        df = self.data_service.get_raw_dataframe().copy()
        selected_features = features or DEFAULT_FEATURES

        X = self._prepare_features(df, selected_features)
        if len(X) < n_clusters:
            raise ValueError(f"Number of samples ({len(X)}) is less than clusters ({n_clusters}).")

        scaler = StandardScaler() if use_scaler else None
        if scaler:
            X_proc = scaler.fit_transform(X)
        else:
            X_proc = X

        # Fit K-Means
        kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=random_state,
            n_init=n_init
        )
        labels = kmeans.fit_predict(X_proc)

        # Inertia
        inertia = float(kmeans.inertia_)

        # Silhouette score (valid when 2 <= n_clusters < len(X_proc))
        sil_score = None
        if 2 <= n_clusters < len(X_proc):
            try:
                sil_score = round(float(silhouette_score(X_proc, labels)), 4)
            except Exception:
                sil_score = None

        # Calculate centroids in original unscaled space
        if scaler:
            unscaled_centroids = scaler.inverse_transform(kmeans.cluster_centers_)
        else:
            unscaled_centroids = kmeans.cluster_centers_

        # Calculate global feature averages
        global_averages = {
            f: round(float(np.mean(X[:, idx])), 2)
            for idx, f in enumerate(selected_features)
        }

        # Profile each cluster
        cluster_profiles = []
        df_assigned = df.copy()
        df_assigned["cluster"] = labels

        for cid in range(n_clusters):
            c_mask = (labels == cid)
            c_count = int(np.sum(c_mask))
            c_pct = round((c_count / len(labels)) * 100, 2)

            c_means = {}
            c_medians = {}
            c_mins = {}
            c_maxs = {}
            c_centroids = {}

            for idx, f in enumerate(selected_features):
                vals = X[c_mask, idx]
                c_means[f] = round(float(np.mean(vals)), 2) if len(vals) > 0 else 0.0
                c_medians[f] = round(float(np.median(vals)), 2) if len(vals) > 0 else 0.0
                c_mins[f] = round(float(np.min(vals)), 2) if len(vals) > 0 else 0.0
                c_maxs[f] = round(float(np.max(vals)), 2) if len(vals) > 0 else 0.0
                c_centroids[f] = round(float(unscaled_centroids[cid, idx]), 2)

            default_label, characteristics, strategy = self._derive_dynamic_segment_label(
                c_means, global_averages, cid
            )
            # Use user-edited label if exists
            active_label = self.custom_labels.get(cid, default_label)

            color = CLUSTER_PALETTE[cid % len(CLUSTER_PALETTE)]

            cluster_profiles.append({
                "cluster_id": cid,
                "label": active_label,
                "count": c_count,
                "percentage": c_pct,
                "feature_means": c_means,
                "feature_medians": c_medians,
                "feature_mins": c_mins,
                "feature_maxs": c_maxs,
                "centroid_coordinates": c_centroids,
                "color": color,
                "characteristics": characteristics,
                "marketing_strategy": strategy
            })

        # Persist model & scaler
        self.model = kmeans
        self.scaler = scaler
        
        metadata = {
            "n_clusters": n_clusters,
            "features": selected_features,
            "use_scaler": use_scaler,
            "random_state": random_state,
            "n_init": n_init,
            "inertia": round(inertia, 2),
            "silhouette_score": sil_score,
            "clusters": cluster_profiles,
            "global_averages": global_averages,
            "trained_at": datetime.datetime.now().isoformat(),
            "total_customers": len(df),
            "custom_labels": self.custom_labels
        }
        self.metadata = metadata

        try:
            joblib.dump({"model": kmeans, "scaler": scaler}, MODEL_SAVE_PATH)
            with open(METADATA_SAVE_PATH, "w") as f:
                json.dump(metadata, f, indent=2)
        except Exception as e:
            print(f"[MLService] Error saving model to disk: {e}")

        # Update clustered dataframe in memory
        self._apply_clustering_to_dataset()

        return metadata

    def update_cluster_label(self, cluster_id: int, new_label: str) -> Dict[str, Any]:
        """Update and persist a user-customized label for a cluster."""
        if not new_label or not new_label.strip():
            raise ValueError("Segment label cannot be empty.")
        
        self.custom_labels[cluster_id] = new_label.strip()

        if self.metadata and "clusters" in self.metadata:
            for c in self.metadata["clusters"]:
                if c["cluster_id"] == cluster_id:
                    c["label"] = new_label.strip()
            self.metadata["custom_labels"] = self.custom_labels
            with open(METADATA_SAVE_PATH, "w") as f:
                json.dump(self.metadata, f, indent=2)

        self._apply_clustering_to_dataset()

        return {"status": "success", "cluster_id": cluster_id, "label": new_label.strip()}

    def compute_elbow_and_silhouette(
        self,
        features: Optional[List[str]] = None,
        min_k: int = 2,
        max_k: int = 10,
        use_scaler: bool = True
    ) -> Dict[str, Any]:
        """
        Runs K-Means across k in [min_k, max_k] to generate Inertia (Elbow)
        and Silhouette scores for model evaluation.
        """
        df = self.data_service.get_raw_dataframe().copy()
        selected_features = features or DEFAULT_FEATURES
        X = self._prepare_features(df, selected_features)

        if use_scaler:
            scaler = StandardScaler()
            X_proc = scaler.fit_transform(X)
        else:
            X_proc = X

        points = []
        best_sil_k = None
        max_sil = -2.0

        for k in range(min_k, min(max_k + 1, len(X_proc))):
            km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
            km_labels = km.fit_predict(X_proc)
            inertia_val = round(float(km.inertia_), 2)

            sil = None
            try:
                sil = round(float(silhouette_score(X_proc, km_labels)), 4)
                if sil > max_sil:
                    max_sil = sil
                    best_sil_k = k
            except Exception:
                pass

            points.append({
                "k": k,
                "inertia": inertia_val,
                "silhouette_score": sil
            })

        # Calculate elbow using maximum second derivative / angle change
        recommended_k = 5  # standard optimal for Mall Customers
        if len(points) >= 3:
            inertias = [p["inertia"] for p in points]
            # Simple second difference heuristic
            diffs = np.diff(inertias)
            second_diffs = np.diff(diffs)
            elbow_idx = int(np.argmax(second_diffs)) + 1
            if elbow_idx < len(points):
                recommended_k = points[elbow_idx]["k"]

        explanation = (
            f"Evaluation reveals an optimal elbow point around k={recommended_k}. "
            f"The highest silhouette score is observed at k={best_sil_k or 5} (score: {max_sil:.4f}). "
            "Note: Mathematical metrics like Silhouette and Inertia provide empirical guidance, "
            "but business interpretability and marketing actionability are equally critical when selecting K."
        )

        return {
            "points": points,
            "recommended_k": recommended_k,
            "silhouette_best_k": best_sil_k,
            "explanation": explanation
        }

    def get_customer_detail(self, customer_id: int) -> Dict[str, Any]:
        """Fetch individual customer details, distance to centroid, and percentiles."""
        if self.clustered_df is None:
            if self.model is None:
                self.train_kmeans()
            else:
                self._apply_clustering_to_dataset()

        df = self.clustered_df
        record_rows = df[df["CustomerID"] == customer_id]
        if record_rows.empty:
            raise ValueError(f"Customer with ID {customer_id} not found.")

        row = record_rows.iloc[0].to_dict()
        cid = int(row.get("cluster", 0))

        # Percentiles
        percentiles = {}
        for col in ["Age", "Annual Income (k$)", "Spending Score (1-100)"]:
            if col in df.columns:
                series = df[col].dropna()
                val = row.get(col, 0)
                pct = round(float((series < val).mean() * 100), 1)
                percentiles[col] = pct

        # Segment info
        seg_info = None
        if self.metadata and "clusters" in self.metadata:
            for c in self.metadata["clusters"]:
                if c["cluster_id"] == cid:
                    seg_info = c
                    break

        # Distance to centroid
        distance_to_centroid = None
        if self.model is not None and seg_info is not None:
            features = self.metadata.get("features", DEFAULT_FEATURES)
            try:
                cust_vals = np.array([float(row.get(f, 0)) for f in features])
                centroid_vals = np.array([float(seg_info["centroid_coordinates"].get(f, 0)) for f in features])
                distance_to_centroid = round(float(np.linalg.norm(cust_vals - centroid_vals)), 2)
            except Exception:
                distance_to_centroid = None

        key_recommendation = (
            seg_info.get("marketing_strategy") if seg_info
            else "Standard engagement campaign."
        )

        return {
            "customer": row,
            "percentiles": percentiles,
            "segment_info": seg_info,
            "distance_to_centroid": distance_to_centroid,
            "key_recommendation": key_recommendation
        }
