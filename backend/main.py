import io
import os
import traceback

import numpy as np
import pandas as pd
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from groq import Groq

from analyzer import clean_and_analyze
from charts import generate_charts

app = FastAPI(title="Big Data Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 50 * 1024 * 1024


def read_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".csv":
        for encoding in ["utf-8", "cp1251", "latin-1"]:
            try:
                return pd.read_csv(io.BytesIO(file_bytes), encoding=encoding)
            except UnicodeDecodeError:
                continue
        raise ValueError("Не удалось определить кодировку CSV файла")
    elif ext in [".xlsx", ".xls"]:
        return pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError(f"Неподдерживаемый формат: {ext}. Используйте CSV или XLSX.")


def make_json_safe(obj):
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_safe(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return None if np.isnan(obj) else float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return make_json_safe(obj.tolist())
    elif isinstance(obj, float) and np.isnan(obj):
        return None
    return obj


@app.get("/")
def root():
    return {"status": "ok", "message": "Big Data Analyzer API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не выбран")
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Файл превышает 50 MB")
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Файл пустой")
    try:
        df = read_file(file_bytes, file.filename)
        if df.empty:
            raise HTTPException(status_code=400, detail="Датасет не содержит данных")
        if len(df.columns) < 2:
            raise HTTPException(status_code=400, detail="Нужно минимум 2 колонки")
        analysis = clean_and_analyze(df)
        clean_df = analysis.pop("df")
        charts = generate_charts(clean_df, analysis["summary"]["column_types"])
        response = {
            "filename": file.filename,
            "summary": analysis["summary"],
            "descriptive_stats": analysis["descriptive_stats"],
            "top_correlations": analysis["top_correlations"],
            "preview": analysis["preview"],
            "charts": charts,
        }
        return JSONResponse(content=make_json_safe(response))
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")


class InsightsRequest(BaseModel):
    filename: str
    summary: dict
    descriptive_stats: dict
    top_correlations: list


@app.post("/insights")
async def get_insights(req: InsightsRequest):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY не установлен.")

    col_types = req.summary.get("column_types", {})
    clean_shape = req.summary.get("clean_shape", {})
    missing = req.summary.get("missing_values", {})

    stats_lines = []
    for col, v in req.descriptive_stats.items():
        mean, std, mn, mx = v.get("mean"), v.get("std"), v.get("min"), v.get("max")
        if all(x is not None for x in [mean, std, mn, mx]):
            stats_lines.append(f"  {col}: mean={mean:.2f}, std={std:.2f}, min={mn:.2f}, max={mx:.2f}")
        else:
            stats_lines.append(f"  {col}: N/A")

    corr_lines = [
        f"  {c['col1']} <-> {c['col2']}: r={c['correlation']:.3f}"
        for c in req.top_correlations[:5]
    ]

    prompt = f"""You are a senior data analyst. Analyze this dataset and provide actionable business insights.

Dataset: {req.filename}
Shape: {clean_shape.get('rows','?')} rows x {clean_shape.get('cols','?')} columns
Columns with missing values filled: {len(missing)}

Column types:
- Numeric: {', '.join(col_types.get('numeric', [])) or 'none'}
- Categorical: {', '.join(col_types.get('categorical', [])) or 'none'}
- Datetime: {', '.join(col_types.get('datetime', [])) or 'none'}

Descriptive statistics:
{chr(10).join(stats_lines) or 'N/A'}

Top correlations:
{chr(10).join(corr_lines) or 'N/A'}

Provide a structured analysis:
📊 Key Patterns & Trends (3-4 findings with numbers)
💡 Business Recommendations (2-3 actionable suggestions)
⚠️ Data Quality Notes
🔍 Surprising Finding (if any)

Be specific and concise."""

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
        )
        return {"insights": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API ошибка: {str(e)}")
