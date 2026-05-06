import pandas as pd
import numpy as np
from typing import Any


def clean_and_analyze(df: pd.DataFrame) -> dict[str, Any]:
    """Основная функция анализа датасета."""

    original_shape = df.shape

    df = df.dropna(how="all").dropna(axis=1, how="all")

    df = df.reset_index(drop=True)

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = []
    datetime_cols = []
    text_cols = []

    for col in df.select_dtypes(exclude=[np.number]).columns:
        try:
            converted = pd.to_datetime(df[col], infer_datetime_format=True, errors="raise")
            df[col] = converted
            datetime_cols.append(col)
            continue
        except Exception:
            pass

        n_unique = df[col].nunique()
        n_total = len(df[col].dropna())

        if n_unique <= 30 or (n_total > 0 and n_unique / n_total < 0.05):
            categorical_cols.append(col)
        else:
            text_cols.append(col)

    missing_info = {}
    for col in df.columns:
        n_missing = int(df[col].isna().sum())
        if n_missing > 0:
            missing_info[col] = {
                "count": n_missing,
                "pct": round(n_missing / len(df) * 100, 2),
            }

    for col in numeric_cols:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())

    for col in categorical_cols:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")

    desc_stats = {}
    if numeric_cols:
        stats_df = df[numeric_cols].describe().round(4)
        desc_stats = stats_df.to_dict()

    top_correlations = []
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr().round(4)
        corr_pairs = (
            corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
            .stack()
            .reset_index()
        )
        corr_pairs.columns = ["col1", "col2", "correlation"]
        corr_pairs["abs_corr"] = corr_pairs["correlation"].abs()
        top_correlations = (
            corr_pairs.nlargest(10, "abs_corr")
            .drop(columns="abs_corr")
            .to_dict(orient="records")
        )

    preview_df = df.head(20).copy()
    for col in datetime_cols:
        if col in preview_df.columns:
            try:
                preview_df[col] = preview_df[col].dt.strftime("%Y-%m-%d")
            except Exception:
                preview_df[col] = preview_df[col].astype(str)

    preview_records = preview_df.where(pd.notnull(preview_df), None).to_dict(orient="records")

    return {
        "df": df, 
        "summary": {
            "original_shape": {"rows": original_shape[0], "cols": original_shape[1]},
            "clean_shape": {"rows": df.shape[0], "cols": df.shape[1]},
            "columns": df.columns.tolist(),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "missing_values": missing_info,
            "column_types": {
                "numeric": numeric_cols,
                "categorical": categorical_cols,
                "datetime": datetime_cols,
                "text": text_cols,
            },
        },
        "descriptive_stats": desc_stats,
        "top_correlations": top_correlations,
        "preview": preview_records,
    }