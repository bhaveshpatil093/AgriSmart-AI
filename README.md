
# AgriSmart AI: Climate-Smart Agriculture (Nashik Edition)

A high-fidelity platform specialized for the Nashik agricultural belt, empowering farmers with AI-driven climate resilience models for Grapes, Onions, and Tomatoes.

## 🚀 Vision
To bridge the gap between traditional agricultural wisdom and cutting-edge meteorological AI, providing precision guidance to smallholder and commercial farmers in the semi-arid Maharashtra region.

## 📊 Core Feature Modules

### 1. Historical Decadal Analysis (Task 9)
- **Moving Averages (SMA)**: 3-year rolling trends for temperature and rainfall.
- **Anomaly Detection**: Standard deviation-based identifying of "extreme years".
- **Nashik Baseline**: Comparative analysis against district averages.

### 2. Rainfall Prediction (Task 10)
- **Vertex AI Integration**: Powered by localized time-series forecasting.
- **Accuracy Metrics**: Live monitoring of RMSE and MAE vs IMD (India Meteorological Department) baselines.
- **A/B Testing**: Continuous optimization between model generations.

### 3. Precision Irrigation (Task 11)
- **Phenological Scheduler**: Crop-specific Kc stages (e.g., Thompson Seedless bunch development).
- **Soil Adaptive**: Logic adjustments for the region's diverse "Black Cotton" and "Loamy" soils.
- **Skip Logic**: Automatic scheduling shifts based on precipitation forecasts.

### 4. Extreme Weather Impact (Task 12)
- **Vulnerability Models**: Specialized risk scoring for winter frost burn and monsoon waterlogging.
- **Insurance Ready**: Automatic report compilation for PMFBY (Pradhan Mantri Fasal Bima Yojana) claims.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Recharts.
- **AI/ML**: Google Gemini (Flash 2.5/Pro 3.0), Vertex AI Prediction.
- **Infrastructure**: Firestore (PWA Sync), Cloud SQL (Longitudinal Analytics).

## 📦 Setup & Branching
- **Main**: Production-ready code.
- **Develop**: Active feature integration.
- **Feature Branches**: `feat/rainfall-ml`, `feat/irrigation-scheduler`.

**API Configuration**: Ensure `process.env.API_KEY` is set in `.env.local`.
