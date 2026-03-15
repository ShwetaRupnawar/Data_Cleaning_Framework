import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import Papa from "papaparse";
import {
  UploadCloud, FileText, BarChart2, CheckCircle,
  Settings, Download, Activity, ArrowRight, X, Shuffle, Sparkles
} from "lucide-react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("IDLE"); // IDLE, ANALYZED, PROCESSING, DONE

  const [previewStats, setPreviewStats] = useState({ rows: 0, cols: 0, acc: 0 });
  const [results, setResults] = useState(null);

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

  // Drag and Drop handlers
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    let interval;
    if (step === "PROCESSING") {
      interval = setInterval(() => {
        setProcessStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 1500); // Fake progress stages
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
        let missing = 0;
        let total = cols * rows;

        // Fast estimation of missing
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

        setPreviewStats({
          rows,
          cols,
          acc: (estAcc * 100).toFixed(2)
        });
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
        <input
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <UploadCloud size={64} color={isDragActive ? "#c084fc" : "#6366f1"} style={{ margin: "0 auto 24px" }} />
        <h2 style={{ fontSize: "24px", margin: "0 0 12px", fontWeight: "600" }}>
          {step === "ANALYZING" ? "Scanning Dataset..." : (isDragActive ? "Drop CSV Here" : "Drag & Drop CSV Dataset")}
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "16px", margin: 0 }}>
          or click to browse your files (CSV only)
        </p>
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
          <button onClick={resetAll} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={MetricCardStyle}>
            <span style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart2 size={16} /> Total Rows
            </span>
            <span style={{ fontSize: "28px", fontWeight: "700" }}>{previewStats.rows.toLocaleString()}</span>
          </div>
          <div style={MetricCardStyle}>
            <span style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={16} /> Data Features
            </span>
            <span style={{ fontSize: "28px", fontWeight: "700" }}>{previewStats.cols.toLocaleString()}</span>
          </div>
          <div style={MetricCardStyle}>
            <span style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} /> Est. Cleanliness
            </span>
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
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            transition: "transform 0.1s"
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <Shuffle size={20} /> Initialize ML Pipeline
        </button>
      </div>
    );
  }

  if (step === "PROCESSING") {
    // calculate a fake progress percentage
    const progress = Math.min((processStage / stages.length) * 100 + 15, 95);
    return (
      <div style={{ ...CardStyle, textAlign: "center", padding: "60px 40px" }}>
        <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 32px" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #c084fc", animation: "spin 1s linear infinite" }} />
          <Activity size={32} color="#c084fc" style={{ position: "absolute", top: "24px", left: "24px", animation: "pulse 2s infinite" }} />
        </div>
        <h2 style={{ fontSize: "24px", margin: "0 0 12px", fontWeight: "600" }}>Executing Pipeline</h2>
        <p style={{ color: "#c084fc", fontSize: "16px", margin: "0 0 32px", minHeight: "24px", fontWeight: "500", letterSpacing: "0.5px" }}>
          {stages[Math.min(processStage, stages.length - 1)]}
        </p>

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

    return (
      <div style={{ ...CardStyle, padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "72px", height: "72px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: "28px", margin: "0 0 8px", fontWeight: "700" }}>Pipeline Completed successfully</h2>
          <p style={{ color: "#94a3b8", fontSize: "16px", margin: 0 }}>
            {results.dataset} has been optimized and is ready for model training.
          </p>
        </div>

        {/* Comparison Board */}
        <div style={{ display: "flex", alignItems: "stretch", gap: "24px", marginBottom: "40px", flexDirection: "row" }}>
          {/* Before */}
          <div style={{ flex: 1, background: "rgba(255, 255, 255, 0.03)", padding: "24px", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <h4 style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>Raw Data</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Accuracy (Non-null)</span>
                <span style={{ fontSize: "24px", fontWeight: "600" }}>{rAcc}%</span>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Rows</span>
                  <span style={{ fontSize: "18px" }}>{previewStats.rows.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Cols</span>
                  <span style={{ fontSize: "18px" }}>{previewStats.cols.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
            <ArrowRight size={32} />
          </div>

          {/* After */}
          <div style={{ flex: 1, background: "rgba(16, 185, 129, 0.05)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <h4 style={{ margin: "0 0 16px", color: "#34d399", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} /> Cleaned Data
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Accuracy (Non-null)</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}>{cAcc}%</span>
                  <span style={{ fontSize: "14px", color: "#34d399", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: "12px" }}>+{imp}%</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Rows</span>
                  <span style={{ fontSize: "18px", color: "#f8fafc" }}>{previewStats.rows.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Cols</span>
                  <span style={{ fontSize: "18px", color: "#f8fafc" }}>{previewStats.cols.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={resetAll}
            style={{
              flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            Clean Another Dataset
          </button>

          <a
            href={results.cleaned_file_url}
            download
            style={{
              flex: 2, padding: "16px", borderRadius: "12px", border: "none",
              background: "#10b981", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer",
              textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
            }}
          >
            <Download size={20} /> Download Target Output
          </a>
        </div>
      </div>
    );
  }

  return null;
}

export default FileUpload;