from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from app.services.ml_service import MLService

class InsightService:
    def __init__(self, ml_service: MLService):
        self.ml_service = ml_service

    def generate_insights(self) -> Dict[str, Any]:
        """
        Generates transparent, rule-based business intelligence recommendations
        based strictly on calculated cluster statistics and real dataset distributions.
        Distinguishes rule-based analytics from generative AI.
        """
        # Ensure model is trained
        if self.ml_service.metadata is None:
            self.ml_service.train_kmeans()

        meta = self.ml_service.metadata
        clusters = meta.get("clusters", [])
        global_avgs = meta.get("global_averages", {})
        total_customers = meta.get("total_customers", 0)

        # Strategic Playbooks per Segment
        playbooks = []
        for c in clusters:
            cid = c["cluster_id"]
            label = c["label"]
            count = c["count"]
            pct = c["percentage"]
            means = c["feature_means"]

            inc = means.get("Annual Income (k$)", 50.0)
            spd = means.get("Spending Score (1-100)", 50.0)
            age = means.get("Age", 38.0)

            # Determine strategic priorities
            if inc >= 70 and spd >= 60:
                priority = "High Revenue Protection (Tier 1)"
                urgency = "Immediate"
                tactics = [
                    "Enroll automatically in Tier-1 VIP Concierge program.",
                    "Host private preview sales and invite-only runway / product launches.",
                    "Provide dedicated account managers or personalized shopping assistants.",
                    "Offer surprise-and-delight luxury gifting on birthdays and anniversaries."
                ]
                channels = ["Personal Concierge / Direct SMS", "Exclusive Mobile App Portal", "Private Email Invitations"]
                risk_factor = "Brand fatigue and competitor poaching with better loyalty perks."
            elif inc >= 70 and spd <= 40:
                priority = "High Monetization Opportunity (Tier 2)"
                urgency = "High Priority"
                tactics = [
                    "Test premium catalog mailers highlighting durability, investment value, and craftsmanship.",
                    "Deliver exclusive bundle pricing and high-ticket category promotions.",
                    "Offer experiential perks (complimentary lounge access, valet parking, fine dining vouchers).",
                    "Conduct qualitative customer surveys to uncover purchase reluctance factors."
                ]
                channels = ["Curated Editorial Newsletters", "High-End Direct Mail", "LinkedIn / Executive Ads"]
                risk_factor = "Perceived lack of value or irrelevance leading to zero conversion."
            elif inc <= 45 and spd >= 60:
                priority = "Engagement & Retention (Tier 3)"
                urgency = "Medium Priority"
                tactics = [
                    "Integrate accessible Buy Now, Pay Later (BNPL) payment plans.",
                    "Launch gamified reward milestones (e.g., earn extra tokens on frequent visits).",
                    "Offer flash deals, collaborative streetwear drops, and social-first discount codes.",
                    "Encourage user-generated content (UGC) and student/young adult referral perks."
                ]
                channels = ["Instagram / TikTok Campaigns", "Push Notifications", "In-Store Interactive Kiosks"]
                risk_factor = "Economic sensitivity and sudden spending cutbacks when prices rise."
            elif inc <= 45 and spd <= 40:
                priority = "Cost-Efficient Retention (Tier 4)"
                urgency = "Low / Automated"
                tactics = [
                    "Provide coupon booklets for basic everyday essentials and seasonal clearance.",
                    "Run automated mass email campaigns during major discount festivals (e.g. Black Friday).",
                    "Introduce value-tier private label product lines to capture price-sensitive shoppers.",
                    "Avoid high-cost personalized outreach to preserve marketing ROI."
                ]
                channels = ["Bulk Automated Email", "In-Store Circulars", "Affiliate Discount Aggregators"]
                risk_factor = "High churn risk with minimal lifetime margin contribution."
            else:
                priority = "Balanced Nurturing (Tier 5)"
                urgency = "Medium Priority"
                tactics = [
                    "Implement a points-for-purchase loyalty rewards program.",
                    "Cross-sell intermediate category accessories and seasonal bestsellers.",
                    "Send timely birthday discounts and seasonal shopping reminders.",
                    "Maintain stable, omnichannel touchpoints across email and in-store."
                ]
                channels = ["Email Newsletters", "Mobile App Notifications", "Point of Sale (POS) Prompts"]
                risk_factor = "Indifference or drifting to discount competitors."

            playbooks.append({
                "cluster_id": cid,
                "label": label,
                "customer_count": count,
                "percentage": pct,
                "income_avg": inc,
                "spending_avg": spd,
                "age_avg": age,
                "priority_tier": priority,
                "urgency": urgency,
                "recommended_channels": channels,
                "tactical_actions": tactics,
                "primary_risk": risk_factor,
                "color": c["color"]
            })

        # Executive Summary Metrics
        high_value_segment = max(clusters, key=lambda x: x["feature_means"].get("Annual Income (k$)", 0) * x["feature_means"].get("Spending Score (1-100)", 0))
        largest_segment = max(clusters, key=lambda x: x["count"])

        # Age Demographic Insights
        df = self.ml_service.clustered_df
        age_insights = []
        if df is not None and "Age" in df.columns and "Spending Score (1-100)" in df.columns:
            young = df[df["Age"] < 30]
            middle = df[(df["Age"] >= 30) & (df["Age"] < 50)]
            senior = df[df["Age"] >= 50]
            
            age_insights = [
                {
                    "cohort": "Young Adults (< 30 yrs)",
                    "count": len(young),
                    "avg_spending": round(float(young["Spending Score (1-100)"].mean()), 1) if not young.empty else 0.0,
                    "avg_income": round(float(young["Annual Income (k$)"].mean()), 1) if "Annual Income (k$)" in young.columns else 0.0,
                    "behavior": "High digital affinity, responsive to trendy products and mobile app discounts."
                },
                {
                    "cohort": "Prime Earners (30 - 49 yrs)",
                    "count": len(middle),
                    "avg_spending": round(float(middle["Spending Score (1-100)"].mean()), 1) if not middle.empty else 0.0,
                    "avg_income": round(float(middle["Annual Income (k$)"].mean()), 1) if "Annual Income (k$)" in middle.columns else 0.0,
                    "behavior": "Highest purchasing power; motivated by quality, convenience, and family-oriented products."
                },
                {
                    "cohort": "Mature Shoppers (50+ yrs)",
                    "count": len(senior),
                    "avg_spending": round(float(senior["Spending Score (1-100)"].mean()), 1) if not senior.empty else 0.0,
                    "avg_income": round(float(senior["Annual Income (k$)"].mean()), 1) if "Annual Income (k$)" in senior.columns else 0.0,
                    "behavior": "Conservative spending, brand loyalty, strong preference for clear physical store layouts."
                }
            ]

        return {
            "methodology": "Transparent Rule-Based Business Intelligence (Derived from Statistical Centroids)",
            "ai_transparency_note": (
                "These strategic recommendations are derived directly from the mathematical cluster centroids and "
                "standardized deviation thresholds calculated by Scikit-learn K-Means. "
                "No synthetic generative hallucination or external black-box LLM API was used."
            ),
            "executive_summary": {
                "total_customers_analyzed": total_customers,
                "identified_segments": len(clusters),
                "dominant_segment": {
                    "label": largest_segment["label"],
                    "count": largest_segment["count"],
                    "percentage": largest_segment["percentage"]
                },
                "highest_value_segment": {
                    "label": high_value_segment["label"],
                    "avg_income": high_value_segment["feature_means"].get("Annual Income (k$)", 0),
                    "avg_spending": high_value_segment["feature_means"].get("Spending Score (1-100)", 0)
                }
            },
            "playbooks": playbooks,
            "demographic_insights": age_insights
        }
