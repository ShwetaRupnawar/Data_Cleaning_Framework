import pandas as pd
import os
import numpy as np

class MLPipeline:
    """
    Fully dynamic ML pipeline for tabular datasets.
    Handles:
    - Loading any CSV
    - Detecting numeric/categorical columns
    - Missing value handling
    - Anomaly detection & capping
    - Categorical cleaning
    - Dynamic metric calculation
    """

    def __init__(self, file_path):
        self.file_path = file_path
        self.df = None
        self.cleaned_df = None
        self.num_cols = []
        self.cat_cols = []
        self.metrics = {}
        self.cleaning_report = {
            "duplicates_removed": 0,
            "missing_values_filled": 0,
            "outliers_handled": 0,
            "columns_dropped": 0
        }

    def load_data(self):
        if not os.path.exists(self.file_path):
            raise FileNotFoundError("Dataset file not found.")
        self.df = pd.read_csv(self.file_path)
        return self.df

    def identify_columns(self):
        self.num_cols = self.df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        self.cat_cols = self.df.select_dtypes(include=['object']).columns.tolist()

    def extract_raw_stats(self):
        self.identify_columns()
        
        preview_data = self.df.head(50).replace({np.nan: None}).to_dict(orient="records")
        missing_summary = self.df.isnull().sum().to_dict()
        
        self.raw_stats = {
            "total_rows": int(len(self.df)),
            "total_columns": int(len(self.df.columns)),
            "numeric_columns": self.num_cols,
            "categorical_columns": self.cat_cols,
            "missing_summary": missing_summary,
            "duplicate_count": int(self.df.duplicated().sum()),
            "preview_data": preview_data
        }

    def handle_duplicates(self):
        dup_count = self.df.duplicated().sum()
        self.cleaning_report["duplicates_removed"] = int(dup_count)
        self.df = self.df.drop_duplicates().copy()

    def handle_missing(self):
        missing_count = self.df.isnull().sum().sum()
        self.cleaning_report["missing_values_filled"] = int(missing_count)
        
        # Numeric → median
        for col in self.num_cols:
            self.df[col] = self.df[col].fillna(self.df[col].median())

        # Categorical → Unknown
        for col in self.cat_cols:
            self.df[col] = self.df[col].fillna('Unknown')

    def handle_anomalies(self):
        # IQR-based capping
        outlier_count = 0
        for col in self.num_cols:
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            
            outlier_mask = (self.df[col] < lower) | (self.df[col] > upper)
            outlier_count += outlier_mask.sum()
            
            self.df[col] = np.where(self.df[col] < lower, lower, self.df[col])
            self.df[col] = np.where(self.df[col] > upper, upper, self.df[col])
            
        self.cleaning_report["outliers_handled"] = int(outlier_count)

    def clean_categorical(self):
        for col in self.cat_cols:
            self.df[col] = self.df[col].astype(str).str.strip().str.lower()

    def clean_data(self):
        if self.df is None:
            raise ValueError("Data not loaded. Call load_data() first.")
        self.handle_duplicates()
        self.handle_missing()
        self.handle_anomalies()
        self.clean_categorical()
        self.cleaned_df = self.df.copy()
        return self.cleaned_df

    def calculate_metrics(self):
        row_count = len(self.df)
        column_count = len(self.df.columns)

        # Before cleaning it was len(self.df) + dups removed
        original_row_count = self.raw_stats["total_rows"]
        
        raw_missing = sum(self.raw_stats["missing_summary"].values())
        raw_score = 1 - (raw_missing / (original_row_count * column_count + 1e-6))

        cleaned_missing = self.cleaned_df.isnull().sum().sum()
        cleaned_score = 1 - (cleaned_missing / (row_count * column_count + 1e-6))

        improvement = cleaned_score - raw_score

        self.metrics = {
            "row_count": row_count,
            "column_count": column_count,
            "raw_score": round(raw_score, 4),
            "cleaned_score": round(cleaned_score, 4),
            "improvement": round(improvement, 4),
        }
        
        self.cleaned_stats = {
            "total_rows_after": row_count,
            "total_columns_after": column_count,
        }

    def run(self):
        self.load_data()
        self.extract_raw_stats()
        self.clean_data()
        self.calculate_metrics()
        
        # Save cleaned CSV
        base_dir = os.path.dirname(os.path.dirname(self.file_path))
        cleaned_dir = os.path.join(base_dir, 'cleaned')
        os.makedirs(cleaned_dir, exist_ok=True)
        
        filename = os.path.basename(self.file_path)
        name, ext = os.path.splitext(filename)
        cleaned_filename = os.path.join(cleaned_dir, f"{name}_cleaned{ext}")
        
        self.cleaned_df.to_csv(cleaned_filename, index=False)
        
        return {
            "metrics": self.metrics,
            "raw_stats": self.raw_stats,
            "cleaned_stats": self.cleaned_stats,
            "cleaning_report": self.cleaning_report,
            "cleaned_file_path": cleaned_filename
        }
