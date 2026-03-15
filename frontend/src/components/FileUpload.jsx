import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import Papa from "papaparse";
import {
  UploadCloud, FileText, BarChart2, CheckCircle,
  Settings, Download, Activity, ArrowRight, X, Shuffle, Sparkles, Table as TableIcon, List, Eye
} from "lucide-react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("IDLE"); // IDLE, ANALYZED, PROCESSING, DONE

  const [previewStats, setPreviewStats] = useState({ rows: 0, cols: 0, acc: 0 });
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("report"); // report, preview

  const [processStage, setProcessStage] = useState(0);
  const stages = [
    "Uploading secure payload...",
    "Scanning schema and data types...",
    "Imputing missing values...",
    "Clipping anomalies & outliers...",
    "Formatting categorical fields...",
    "Finalizing pipeline metrics..."
  ];

  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    let interval;
    if (step === "PROCESSING") {
      interval = setInterval(() => {
        setProcessStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = () => {
    setIsDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setupFile(e.target.files[0]);
    }
  };

  const setupFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert("Please upload a CSV file");
      return;
    }
    setFile(selectedFile);
    setStep("ANALYZING");

    // Local Fast Preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        const cols = result.meta.fields?.length || 0;
        const rows = result.data.length;
        let sampleSize = Math.min(rows, 1000);
        let sampleMissing = 0;
        for (let i = 0; i < sampleSize; i++) {
          let row = result.data[i];
          for (let key in row) {
            if (row[key] === null || row[key] === '' || row[key] === undefined || String(row[key]).trim().toLowerCase() === 'unknown') {
              sampleMissing++;
            }
          }
        }
        let estAcc = 1 - (sampleMissing / (cols * sampleSize + 0.000001));

        setPreviewStats({ rows, cols, acc: (estAcc * 100).toFixed(2) });
        setStep("ANALYZED");
      }
    });
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetAll = () => {
    setFile(null);
    setStep("IDLE");
    setPreviewStats({ rows: 0, cols: 0, acc: 0 });
    setResults(null);
    setProcessStage(0);
    setActiveTab("report");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startPipeline = async () => {
    setStep("PROCESSING");
    setProcessStage(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/api/ml/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
      setStep("DONE");
    } catch (error) {
      console.error(error);
      alert("Pipeline Failed. Please try again.");
      setStep("ANALYZED");
    }
  };

  const CardStyle = {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    color: "#fff",
    transition: "all 0.3s ease"
  };

  const MetricCardStyle = {
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1
  };

  if (step === "IDLE" || step === "ANALYZING") {
    return (
      <div
        style={{
          ...CardStyle,
          border: isDragActive ? "2px dashed #a855f7" : CardStyle.border,
          background: isDragActive ? "rgba(168, 85, 247, 0.1)" : CardStyle.background,
          cursor: "pointer",
          padding: "60px 20px",
          textAlign: "center"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerUpload}
      >
        <input type="file" accept=".csv" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileChange} />
        <UploadCloud size={64} color={isDragActive ? "#c084fc" : "#6366f1"} style={{ margin: "0 auto 24px" }} />
        <h2 style={{ fontSize: "24px", margin: "0 0 12px", fontWeight: "600" }}>
          {step === "ANALYZING" ? "Scanning Dataset..." : (isDragActive ? "Drop CSV Here" : "Drag & Drop CSV Dataset")}
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "16px", margin: 0 }}>or click to browse your files (CSV only)</p>
      </div>
    );
  }

  if (step === "ANALYZED") {
    return (
      <div style={CardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "12px", borderRadius: "12px" }}>
              <FileText size={24} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "600" }}>{file.name}</h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>{(file.size / 1024).toFixed(1)} KB • Local Analysis</p>
            </div>
          </div>
          <button onClick={resetAll} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px" }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={MetricCardStyle}>
            <span style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><BarChart2 size={16} /> Total Rows</span>
            <span style={{ fontSize: "28px", fontWeight: "700" }}>{previewStats.rows.toLocaleString()}</span>
          </div>
          <div style={MetricCardStyle}>
            <span style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><Settings size={16} /> Data Features</span>
            <span style={{ fontSize: "28px", fontWeight: "700" }}>{previewStats.cols.toLocaleString()}</span>
          </div>
          <div style={MetricCardStyle}>
            <span style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle size={16} /> Est. Cleanliness</span>
            <span style={{ fontSize: "28px", fontWeight: "700", color: "#fcd34d" }}>{previewStats.acc}%</span>
          </div>
        </div>

        <button
          onClick={startPipeline}
          style={{
            width: "100%", padding: "16px", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            color: "#fff", fontSize: "18px", fontWeight: "600", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
        >
          <Shuffle size={20} /> Initialize ML Pipeline
        </button>
      </div>
    );
  }

  if (step === "PROCESSING") {
    const progress = Math.min((processStage / stages.length) * 100 + 15, 95);
    return (
      <div style={{ ...CardStyle, textAlign: "center", padding: "60px 40px" }}>
        <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 32px" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #c084fc", animation: "spin 1s linear infinite" }} />
          <Activity size={32} color="#c084fc" style={{ position: "absolute", top: "24px", left: "24px", animation: "pulse 2s infinite" }} />
        </div>
        <h2 style={{ fontSize: "24px", margin: "0 0 12px", fontWeight: "600" }}>Executing Pipeline</h2>
        <p style={{ color: "#c084fc", fontSize: "16px", margin: "0 0 32px", minHeight: "24px" }}>{stages[Math.min(processStage, stages.length - 1)]}</p>

        <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.3)", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", transition: "width 0.5s ease" }} />
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
        `}</style>
      </div>
    );
  }

  if (step === "DONE" && results) {
    const rAcc = (results.metrics.raw_accuracy * 100).toFixed(2);
    const cAcc = (results.metrics.cleaned_accuracy * 100).toFixed(2);
    const imp = (results.metrics.improvement * 100).toFixed(2);
    const raw = results.raw_stats;
    const rep = results.cleaning_report;
    const cls = results.cleaned_stats;

    // Grab exactly 50 rows for preview or max available
    const previewData = raw.preview_data || [];
    const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

    const missingItems = Object.entries(raw.missing_summary || {}).filter(([k, v]) => v > 0);

    return (
      <div style={{ ...CardStyle, padding: "32px", maxWidth: "900px", margin: "0 auto" }}>

        {/* Header Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            <button
              onClick={() => setActiveTab("report")}
              style={{ background: "none", border: "none", borderBottom: activeTab === "report" ? "2px solid #a855f7" : "2px solid transparent", color: activeTab === "report" ? "#fff" : "#94a3b8", fontSize: "16px", fontWeight: "600", cursor: "pointer", paddingBottom: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
              <Activity size={18} /> Analysis Report
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              style={{ background: "none", border: "none", borderBottom: activeTab === "preview" ? "2px solid #a855f7" : "2px solid transparent", color: activeTab === "preview" ? "#fff" : "#94a3b8", fontSize: "16px", fontWeight: "600", cursor: "pointer", paddingBottom: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
              <TableIcon size={18} /> Dataset Preview (Top 50)
            </button>
          </div>

          <a href={results.cleaned_file_url} download style={{ background: "#10b981", color: "#fff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600" }}>
            <Download size={16} /> Export CSV
          </a>
        </div>

        {activeTab === "report" && (
          <div style={{ textAlign: "left" }}>

            {/* Before vs After */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ flex: 1, background: "rgba(255, 255, 255, 0.03)", padding: "20px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <h4 style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Before Cleaning</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ minWidth: "80px" }}><span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Accuracy</span><span style={{ fontSize: "20px", fontWeight: "600" }}>{rAcc}%</span></div>
                  <div style={{ minWidth: "80px" }}><span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Rows</span><span style={{ fontSize: "16px" }}>{raw.total_rows.toLocaleString()}</span></div>
                  <div style={{ minWidth: "80px" }}><span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Columns</span><span style={{ fontSize: "16px" }}>{raw.total_columns}</span></div>
                  <div style={{ minWidth: "80px" }}><span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Duplicates</span><span style={{ fontSize: "16px", color: raw.duplicate_count > 0 ? "#f87171" : "#fff" }}>{raw.duplicate_count}</span></div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}><ArrowRight size={24} /></div>

              <div style={{ flex: 1, background: "rgba(16, 185, 129, 0.05)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <h4 style={{ margin: "0 0 16px", color: "#34d399", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={14} /> Cleaned Data</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ minWidth: "80px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Accuracy</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>{cAcc}%</span>
                    <span style={{ fontSize: "11px", color: "#10b981", marginLeft: "4px" }}>(+{imp}%)</span>
                  </div>
                  <div style={{ minWidth: "80px" }}><span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Rows</span><span style={{ fontSize: "16px" }}>{cls.total_rows_after.toLocaleString()}</span></div>
                  <div style={{ minWidth: "80px" }}><span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Columns</span><span style={{ fontSize: "16px" }}>{cls.total_columns_after}</span></div>
                </div>
              </div>
            </div>

            {/* Cleaning Report & Stats */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1, background: "rgba(15, 23, 42, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}><Activity size={16} /> Cleaning Operations Log</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "14px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", justifyContent: "space-between" }}><span>Duplicates Removed</span> <span style={{ fontWeight: "600", color: rep.duplicates_removed > 0 ? "#10b981" : "#64748b" }}>{rep.duplicates_removed}</span></li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}><span>Missing Values Imputed</span> <span style={{ fontWeight: "600", color: rep.missing_values_filled > 0 ? "#10b981" : "#64748b" }}>{rep.missing_values_filled}</span></li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}><span>Outliers Clipped (IQR)</span> <span style={{ fontWeight: "600", color: rep.outliers_handled > 0 ? "#10b981" : "#64748b" }}>{rep.outliers_handled}</span></li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}><span>Columns Dropped</span> <span style={{ fontWeight: "600", color: rep.columns_dropped > 0 ? "#10b981" : "#64748b" }}>{rep.columns_dropped}</span></li>
                </ul>
              </div>

              <div style={{ flex: 1, background: "rgba(15, 23, 42, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}><List size={16} /> Dataset Statistics</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "14px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", justifyContent: "space-between" }}><span>Numeric Columns</span> <span style={{ fontWeight: "600" }}>{raw.numeric_columns.length}</span></li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}><span>Categorical Columns</span> <span style={{ fontWeight: "600" }}>{raw.categorical_columns.length}</span></li>
                </ul>

                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "8px" }}>COLUMNS WITH MISSING DATA</span>
                  {missingItems.length === 0 ? (
                    <span style={{ fontSize: "12px", color: "#10b981" }}>No missing data found!</span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {missingItems.map(([col, missing]) => (
                        <div key={col} style={{ fontSize: "11px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "2px 8px", borderRadius: "4px", color: "#fca5a5" }}>
                          {col}: {missing} missing
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={resetAll} style={{ marginTop: "24px", width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", cursor: "pointer" }}>Upload New Dataset</button>
          </div>
        )}

        {activeTab === "preview" && (
          <div style={{ textAlign: "left", overflowX: "auto", maxHeight: "400px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 10 }}>
                <tr>
                  {headers.map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: idx === previewData.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                    {headers.map(h => (
                      <td key={h} style={{ padding: "10px 16px", color: "#e2e8f0", whiteSpace: "nowrap" }}>
                        {row[h] === null ? <span style={{ color: "#fca5a5", fontSize: "11px" }}>[NULL]</span> : String(row[h]).substring(0, 30)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default FileUpload;