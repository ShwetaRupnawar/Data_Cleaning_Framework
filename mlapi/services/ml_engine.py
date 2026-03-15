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

    def load_data(self):
        if not os.path.exists(self.file_path):
            raise FileNotFoundError("Dataset file not found.")
        self.df = pd.read_csv(self.file_path)
        return self.df

    def identify_columns(self):
        self.num_cols = self.df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        self.cat_cols = self.df.select_dtypes(include=['object']).columns.tolist()

    def handle_missing(self):
        # Numeric → median
        for col in self.num_cols:
            self.df[col] = self.df[col].fillna(self.df[col].median())

        # Categorical → Unknown
        for col in self.cat_cols:
            self.df[col] = self.df[col].fillna('Unknown')

    def handle_anomalies(self):
        # IQR-based capping
        for col in self.num_cols:
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            self.df[col] = np.where(self.df[col] < lower, lower, self.df[col])
            self.df[col] = np.where(self.df[col] > upper, upper, self.df[col])

    def clean_categorical(self):
        for col in self.cat_cols:
            self.df[col] = self.df[col].astype(str).str.strip().str.lower()

    def clean_data(self):
        if self.df is None:
            raise ValueError("Data not loaded. Call load_data() first.")
        self.identify_columns()
        self.handle_missing()
        self.handle_anomalies()
        self.clean_categorical()
        self.cleaned_df = self.df.copy()
        return self.cleaned_df

    def calculate_metrics(self):
        """
        Dynamic metrics:
        - row_count
        - column_count
        - raw_score: fraction of non-missing before cleaning
        - cleaned_score: fraction of non-missing after cleaning
        - improvement
        """
        row_count = len(self.df)
        column_count = len(self.df.columns)

        raw_missing = self.df.isnull().sum().sum()
        raw_score = 1 - (raw_missing / (row_count * column_count + 1e-6))

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
        return self.metrics

    def run(self):
        self.load_data()
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
            **self.metrics,
            "cleaned_file_path": cleaned_filename
        }
