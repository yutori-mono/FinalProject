import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json


def df_to_json_safe(df: pd.DataFrame) -> pd.DataFrame:
    """Converts datetime columns to strings for Plotly."""
    df = df.copy()
    for col in df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns:
        df[col] = df[col].dt.strftime("%Y-%m-%d")
    return df


def fig_to_json(fig) -> dict:
    return json.loads(fig.to_json())


def generate_charts(df: pd.DataFrame, column_types: dict) -> list[dict]:
    """Generates all relevant charts and returns a list of Plotly JSON."""
    charts = []
    df = df_to_json_safe(df)

    numeric_cols = column_types.get("numeric", [])
    categorical_cols = column_types.get("categorical", [])
    datetime_cols = column_types.get("datetime", [])

    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr().round(3)
        fig = px.imshow(
            corr,
            text_auto=True,
            color_continuous_scale="RdBu_r",
            zmin=-1, zmax=1,
            title="Correlation Heatmap",
            aspect="auto",
        )
        fig.update_layout(height=500)
        charts.append({"title": "Correlation Heatmap", "type": "heatmap", "data": fig_to_json(fig)})

    for col in numeric_cols[:6]: 
        fig = px.histogram(
            df, x=col, nbins=40,
            title=f"Distribution: {col}",
            color_discrete_sequence=["#6366f1"],
        )
        fig.update_layout(bargap=0.05)
        charts.append({"title": f"Distribution: {col}", "type": "histogram", "data": fig_to_json(fig)})

    if numeric_cols and categorical_cols:
        num_col = numeric_cols[0]
        cat_col = categorical_cols[0]
        top_cats = df[cat_col].value_counts().nlargest(15).index
        df_filtered = df[df[cat_col].isin(top_cats)]
        fig = px.box(
            df_filtered, x=cat_col, y=num_col,
            title=f"Box Plot: {num_col} by {cat_col}",
            color=cat_col,
        )
        fig.update_layout(showlegend=False, height=450)
        charts.append({"title": f"Box Plot: {num_col} by {cat_col}", "type": "box", "data": fig_to_json(fig)})

    for col in categorical_cols[:4]:
        value_counts = df[col].value_counts().nlargest(20).reset_index()
        value_counts.columns = [col, "count"]
        fig = px.bar(
            value_counts, x=col, y="count",
            title=f"Value Counts: {col}",
            color="count",
            color_continuous_scale="Blues",
        )
        fig.update_layout(coloraxis_showscale=False)
        charts.append({"title": f"Value Counts: {col}", "type": "bar", "data": fig_to_json(fig)})

    if categorical_cols:
        col = categorical_cols[0]
        vc = df[col].value_counts().nlargest(10)
        fig = px.pie(
            values=vc.values, names=vc.index,
            title=f"Distribution: {col}",
            hole=0.35,
        )
        charts.append({"title": f"Pie: {col}", "type": "pie", "data": fig_to_json(fig)})

    if len(numeric_cols) >= 2:
        x_col, y_col = numeric_cols[0], numeric_cols[1]
        color_col = categorical_cols[0] if categorical_cols else None
        sample_df = df.sample(min(1000, len(df)), random_state=42)
        fig = px.scatter(
            sample_df, x=x_col, y=y_col,
            color=color_col,
            trendline="ols" if not color_col else None,
            title=f"Scatter: {x_col} vs {y_col}",
            opacity=0.65,
        )
        charts.append({"title": f"Scatter: {x_col} vs {y_col}", "type": "scatter", "data": fig_to_json(fig)})

    if datetime_cols and numeric_cols:
        date_col = datetime_cols[0]
        num_col = numeric_cols[0]
        try:
            ts_df = df[[date_col, num_col]].copy()
            ts_df[date_col] = pd.to_datetime(ts_df[date_col], errors="coerce")
            ts_df = ts_df.dropna().sort_values(date_col)
            ts_df = ts_df.groupby(date_col)[num_col].mean().reset_index()
            fig = px.line(
                ts_df, x=date_col, y=num_col,
                title=f"Trend: {num_col} over {date_col}",
                markers=True,
            )
            charts.append({"title": f"Trend: {num_col} over time", "type": "line", "data": fig_to_json(fig)})
        except Exception:
            pass

    if 2 <= len(numeric_cols) <= 5:
        sample_df = df[numeric_cols].sample(min(500, len(df)), random_state=42)
        if categorical_cols:
            sample_df = sample_df.copy()
            sample_df[categorical_cols[0]] = df.loc[sample_df.index, categorical_cols[0]].values
            fig = px.scatter_matrix(
                sample_df,
                dimensions=numeric_cols,
                color=categorical_cols[0],
                title="Scatter Matrix",
                opacity=0.5,
            )
        else:
            fig = px.scatter_matrix(sample_df, dimensions=numeric_cols, title="Scatter Matrix", opacity=0.5)
        fig.update_traces(diagonal_visible=False)
        charts.append({"title": "Scatter Matrix", "type": "scatter_matrix", "data": fig_to_json(fig)})

    return charts
