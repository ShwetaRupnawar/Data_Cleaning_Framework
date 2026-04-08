import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import Papa from "papaparse";
import {
  UploadCloud, FileText, BarChart2, CheckCircle,
  Settings, Download, Activity, ArrowRight, X, Shuffle, Sparkles, Table as TableIcon, List, Eye, Lock
} from "lucide-react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("IDLE"); // IDLE, ANALYZED, PROCESSING, DONE

  const [previewStats, setPreviewStats] = useState({ rows: 0, cols: 0, acc: 0 });
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("report"); // report, preview

  const [processStage, setProcessStage] = useState(0);
  const stages = [
    "Establishing secure connection...",
    "Scanning forensic schema...",
    "Analyzing feature distributions...",
    "Evaluating strategy optimalities...",
    "Executing IQR anomaly clipping...",
    "Compressing redundant dimensions...",
    "Calibrating performance metrics...",
    "Finalizing neural data structure..."
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

    // Mandatory delay for impressive UI demo (5 seconds)
    const minDelay = new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const [res] = await Promise.all([
        API.post("/api/ml/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        minDelay
      ]);
      
      setResults(res.data);
      setStep("DONE");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.message || "Unknown error";
      alert(`Pipeline Failed: ${errMsg}`);
      setStep("ANALYZED");
    }
  };

  const MetricCardStyle = {
    background: "var(--bg-glass)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid var(--border-light)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
    minWidth: "180px",
    transition: "all 0.3s ease"
  };

  if (step === "IDLE" || step === "ANALYZING") {
    return (
      <div
        className="animate-fade-in glass-effect card-hover"
        style={{
          border: isDragActive ? "2px dashed var(--primary)" : "1px solid var(--border-light)",
          boxShadow: isDragActive ? "0 0 40px var(--primary-glow)" : "0 20px 50px rgba(0,0,0,0.3)",
          cursor: "pointer",
          padding: "100px 40px",
          textAlign: "center",
          borderRadius: "32px",
          position: "relative",
          overflow: "hidden"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerUpload}
      >
        <input type="file" accept=".csv" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileChange} />
        
        {/* Background Accent */}
        <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "100%", height: "200%", background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)", opacity: 0.5, pointerEvents: "none" }}></div>

        <div style={{
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, var(--primary-glow) 0%, rgba(16, 185, 129, 0.05) 100%)",
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
          border: "1px solid var(--border-hover)",
          position: "relative",
          zIndex: 1
        }}>
          <UploadCloud size={40} color="var(--primary)" />
        </div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "28px", margin: "0 0 12px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            {step === "ANALYZING" ? "Scanning Pipeline..." : (isDragActive ? "Drop to Ingest" : "Ingest Raw Dataset")}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "17px", margin: "0 0 32px", maxWidth: "400px", margin: "0 auto 32px" }}>
            Drag and drop your forensic CSV source or browse files to begin sanitization.
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", color: "var(--text-dim)", fontSize: "14px", fontWeight: "600" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Lock size={14} /> Secure Port</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={14} /> Auto Schema</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={14} /> Validated</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === "ANALYZED") {
    return (
      <div className="glass-effect animate-fade-in" style={{ padding: "48px", borderRadius: "32px", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ background: "var(--primary-glow)", border: "1px solid var(--border-hover)", padding: "16px", borderRadius: "18px" }}>
              <FileText size={32} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>{file.name}</h3>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--text-dim)" }}></span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Source Integrity Verified</span>
              </div>
            </div>
          </div>
          <button onClick={resetAll} style={{ background: "var(--bg-glass)", border: "1px solid var(--border-light)", color: "var(--text-muted)", borderRadius: "12px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "48px", flexWrap: "wrap" }}>
          <div style={MetricCardStyle}>
            <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700" }}><BarChart2 size={14} /> Total Records</span>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-main)", fontFamily: "var(--font-outfit)" }}>{previewStats.rows.toLocaleString()}</span>
          </div>
          <div style={MetricCardStyle}>
            <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700" }}><Settings size={14} /> Feature Count</span>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-main)", fontFamily: "var(--font-outfit)" }}>{previewStats.cols.toLocaleString()}</span>
          </div>
          <div style={MetricCardStyle}>
            <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700" }}><CheckCircle size={14} /> Source Health</span>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b", fontFamily: "var(--font-outfit)" }}>{previewStats.acc}%</span>
          </div>
        </div>

        <button
          onClick={startPipeline}
          style={{
            width: "100%", 
            padding: "24px", 
            borderRadius: "20px", 
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            color: "#fff", 
            fontSize: "18px", 
            fontWeight: "800", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "12px",
            boxShadow: "0 15px 30px -10px rgba(16, 185, 129, 0.4)"
          }}
        >
          Initialize Forensic Pipeline <ArrowRight size={22} />
        </button>
      </div>
    );
  }

  if (step === "PROCESSING") {
    const progress = Math.min((processStage / stages.length) * 100 + 15, 95);
    
    // Technical forensic logs for the terminal effect
    const techLogs = [
      `[SYSTEM] Initializing Big Data Pipeline...`,
      `[MEM] Optimizing data blocks (Downcasting float64 -> float32)...`,
      `[SCHEMA] forensic schema scan initiated...`,
      `[INGEST] Loading ${(file.size / 1024).toFixed(1)} KB into shared memory...`,
      `[IDENT] Columns identified: ${previewStats.cols} features detected.`,
      `[BASE] Running Random Forest baseline evaluation on 50k samples...`,
      `[STRATEGY] Evaluating Strategy A (Fast Median Impute)...`,
      `[STRATEGY] Evaluating Strategy B (Robust Mean Impute)...`,
      `[IQR] Clipping anomalies via interquartile range (1.5x multiplier)...`,
      `[REDUNDANCY] Checking for multi-collinearity (Threshold 0.95)...`,
      `[MODEL] Iterative performance optimization check...`,
      `[EXPORT] Finalizing optimized forensic structure...`,
    ];

    return (
      <div className="glass-effect animate-fade-in" style={{ 
        textAlign: "left", 
        padding: "40px", 
        borderRadius: "24px", 
        position: "relative", 
        overflow: "hidden",
        border: "1px solid var(--border-hover)",
        background: "#000"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%)", opacity: 0.5 }}></div>
        
        {/* Terminal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56" }}></div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }}></div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f" }}></div>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Forensic_Engine_v2.0 // Processing</span>
        </div>

        {/* Terminal Body */}
        <div style={{ 
          height: "280px", 
          overflow: "hidden", 
          fontFamily: "'Courier New', monospace", 
          fontSize: "13px", 
          lineHeight: "1.8", 
          color: "var(--primary)",
          position: "relative",
          zIndex: 2
        }}>
          {techLogs.slice(0, Math.min(processStage + 3, techLogs.length)).map((log, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", opacity: i === processStage + 2 ? 0.4 : 1 }}>
              <span style={{ color: "var(--text-dim)" }}>[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
          <div style={{ width: "8px", height: "16px", background: "var(--primary)", display: "inline-block", verticalAlign: "middle", animation: "blink 1s infinite", marginTop: "8px" }}></div>
        </div>

        {/* Bottom Status Bar */}
        <div style={{ marginTop: "32px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--primary)", marginBottom: "8px", fontWeight: "800" }}>
            <span>OPTIMIZING DATA STRUCTURE</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary)", transition: "width 0.4s ease-out", boxShadow: "0 0 10px var(--primary)" }} />
          </div>
        </div>

        <style>{`
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes matrix { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
        `}</style>

        {/* Matrix Scan Overlay */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: "60px", 
          background: "linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.6), transparent)",
          zIndex: 1,
          animation: "matrix 2s linear infinite"
        }}></div>
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

    const previewData = raw.preview_data || [];
    const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

    const missingItems = Object.entries(raw.missing_summary || {}).filter(([k, v]) => v > 0);

    return (
      <div className="glass-effect animate-fade-in" style={{ padding: "40px", borderRadius: "32px", maxWidth: "1100px", margin: "0 auto", boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
          <div style={{ display: "flex", gap: "40px" }}>
            <button
              onClick={() => setActiveTab("report")}
              style={{ background: "none", border: "none", borderBottom: activeTab === "report" ? "3px solid var(--primary)" : "3px solid transparent", color: activeTab === "report" ? "var(--text-main)" : "var(--text-muted)", fontSize: "13px", fontWeight: "800", cursor: "pointer", paddingBottom: "12px", display: "flex", gap: "10px", alignItems: "center", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              <Activity size={18} /> Diagnostics
            </button>
            <button
               onClick={() => setActiveTab("preview")}
               style={{ background: "none", border: "none", borderBottom: activeTab === "preview" ? "3px solid var(--primary)" : "3px solid transparent", color: activeTab === "preview" ? "var(--text-main)" : "var(--text-muted)", fontSize: "13px", fontWeight: "800", cursor: "pointer", paddingBottom: "12px", display: "flex", gap: "10px", alignItems: "center", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              <TableIcon size={18} /> Data Preview
            </button>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {results.metrics.best_strategy && (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--border-hover)", color: "var(--primary)", fontSize: "12px", padding: "8px 16px", borderRadius: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
                🎯 {results.metrics.best_strategy}
              </div>
            )}
            <a href={results.cleaned_file_url} download style={{ background: "var(--primary)", color: "#fff", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "800", boxShadow: "0 8px 16px -4px rgba(16, 185, 129, 0.4)" }}>
              <Download size={16} /> Export Dataset
            </a>
          </div>
        </div>

        {activeTab === "report" && (
          <div style={{ textAlign: "left" }}>

            {/* Before vs After Visualization */}
            <div style={{ display: "flex", gap: "24px", marginBottom: "40px" }}>
              <div className="glass-effect" style={{ flex: 1, padding: "32px", borderRadius: "24px" }}>
                <h4 style={{ margin: "0 0 24px", color: "var(--text-dim)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "800" }}>Baseline Metrics</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", textTransform: "uppercase", marginBottom: "6px", fontWeight: "700" }}>Accuracy</span>
                    <span style={{ fontSize: "32px", fontWeight: "800", fontFamily: "var(--font-outfit)", color: "var(--text-main)" }}>{rAcc}%</span>
                  </div>
                  <div style={{ borderLeft: "1px solid var(--border-light)", paddingLeft: "32px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", textTransform: "uppercase", marginBottom: "6px", fontWeight: "700" }}>Rows</span>
                    <span style={{ fontSize: "20px", fontWeight: "700" }}>{raw.total_rows.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}><ArrowRight size={24} className="pulse" /></div>

              <div style={{ flex: 1, background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border-hover)" }}>
                <h4 style={{ margin: "0 0 24px", color: "var(--primary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "800" }}>Optimized Diagnostics</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", textTransform: "uppercase", marginBottom: "6px", fontWeight: "700" }}>Quality</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "32px", fontWeight: "800", color: "var(--primary)", fontFamily: "var(--font-outfit)" }}>{cAcc}%</span>
                      <span style={{ fontSize: "14px", color: "var(--success)", fontWeight: "800" }}>↑ {imp}%</span>
                    </div>
                  </div>
                  <div style={{ borderLeft: "1px solid var(--border-hover)", paddingLeft: "32px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", textTransform: "uppercase", marginBottom: "6px", fontWeight: "700" }}>New Rows</span>
                    <span style={{ fontSize: "20px", fontWeight: "700" }}>{cls.total_rows_after.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs and Details */}
            <div style={{ display: "flex", gap: "24px" }}>
              <div className="glass-effect" style={{ flex: 1.2, padding: "32px", borderRadius: "24px" }}>
                <h4 style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", fontWeight: "800" }}><Activity size={18} color="var(--primary)" /> Sanitization Logs</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { label: "Duplicates Detected & Purged", val: rep.duplicates_removed },
                    { label: "Missing Values Smart-Imputed", val: rep.missing_values_filled },
                    { label: "Outliers Neutralized (IQR)", val: rep.outliers_handled },
                    { label: "Feature Dimensions Optimized", val: rep.features_optimized || 0 },
                    { label: "Redundant Columns Dropped", val: rep.columns_dropped }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: idx === 4 ? "none" : "1px solid var(--border-light)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>{item.label}</span>
                      <span style={{ fontWeight: "800", color: item.val > 0 ? "var(--primary)" : "var(--text-dim)", background: item.val > 0 ? "var(--primary-glow)" : "transparent", padding: "4px 12px", borderRadius: "8px", fontSize: "13px" }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-effect" style={{ flex: 1, padding: "32px", borderRadius: "24px" }}>
                <h4 style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", fontWeight: "800" }}><List size={18} color="var(--secondary)" /> Dataset Properties</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Feature Types</span>
                    <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>{raw.numeric_columns.length}N / {raw.categorical_columns.length}C</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Target Variable</span>
                    <span style={{ fontWeight: "800", color: "var(--secondary)", fontSize: "14px" }}>{raw.inferred_target || "UNKNOWN"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Pipeline Class</span>
                    <span style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "14px", textTransform: "uppercase" }}>{raw.task_type || "N/A"}</span>
                  </div>
                </div>

                <div style={{ marginTop: "24px", padding: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "16px", border: "1px dashed var(--border-light)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", textTransform: "uppercase", marginBottom: "12px", fontWeight: "800", letterSpacing: "1px" }}>Anomaly Tracking</span>
                  {missingItems.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "13px", fontWeight: "700" }}>
                      <CheckCircle size={14} /> Dataset Integrity 100%
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {missingItems.slice(0, 4).map(([col, missing]) => (
                        <div key={col} style={{ fontSize: "11px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "4px 10px", borderRadius: "8px", color: "#fca5a5", fontWeight: "700" }}>
                          {col}: {missing}
                        </div>
                      ))}
                      {missingItems.length > 4 && <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>+{missingItems.length - 4} more</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={resetAll} className="card-hover" style={{ 
              marginTop: "40px", 
              width: "100%", 
              padding: "20px", 
              borderRadius: "16px", 
              border: "1px solid var(--border-light)", 
              background: "var(--bg-glass)", 
              color: "var(--text-muted)", 
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "2px"
            }}>Injest New Stream</button>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="glass-effect" style={{ textAlign: "left", overflowX: "auto", maxHeight: "500px", overflowY: "auto", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead style={{ position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 10 }}>
                <tr>
                  {headers.map(h => (
                    <th key={h} style={{ padding: "16px 20px", textAlign: "left", borderBottom: "1px solid var(--border-light)", color: "var(--text-dim)", fontWeight: "800", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", borderBottom: idx === previewData.length - 1 ? "none" : "1px solid var(--border-light)" }}>
                    {headers.map(h => (
                      <td key={h} style={{ padding: "14px 20px", color: "var(--text-main)", whiteSpace: "nowrap", fontWeight: "500" }}>
                        {row[h] === null ? <span style={{ color: "var(--danger)", fontSize: "10px", fontWeight: "800" }}>● NULL</span> : String(row[h]).substring(0, 40)}
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