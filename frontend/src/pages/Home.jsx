import FileUpload from "../components/FileUpload";
import { Sun, Moon, Sparkles, CheckCircle, Zap, Shield, BarChart, Database, ArrowRight } from "lucide-react";

function Home({ theme, toggleTheme }) {
  const features = [
    { icon: <CheckCircle size={22} />, title: "Auto Ingestion", desc: "Dynamic schema detection for any CSV source." },
    { icon: <Zap size={22} />, title: "Adaptive Impute", desc: "Selecting optimal math strategies per feature." },
    { icon: <Shield size={22} />, title: "Anomaly Guard", desc: "Statistical outlier clipping via IQR analysis." },
    { icon: <BarChart size={22} />, title: "Feature Tuning", desc: "Removing redundancy and applying scaling." },
    { icon: <Database size={22} />, title: "Model Ready", desc: "Baseline evaluation to ensure data quality." },
    { icon: <Sparkles size={22} />, title: "Feedback Loop", desc: "Continuous pipeline optimization for metrics." },
  ];

  const sectionStyle = {
    padding: "100px 24px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      
      {/* Navbar Overlay */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(2, 6, 6, 0.5)",
        borderBottom: "1px solid var(--border-light)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "8px", 
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px var(--primary-glow)" 
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: "800", letterSpacing: "-0.5px", fontSize: "20px", color: "var(--text-main)", fontFamily: "var(--font-outfit)" }}>NEURA<span style={{ color: "var(--primary)" }}>CLEAN</span></span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
             <button 
              onClick={toggleTheme}
              className="glass-effect"
              style={{
                borderRadius: "10px",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-main)",
                cursor: "pointer",
                border: "1px solid var(--border-light)"
              }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ height: "80px" }}></div>

      {/* Hero Section */}
      <div style={{ ...sectionStyle, padding: "120px 24px 80px", position: "relative" }}>
        {/* Background Glows */}
        <div style={{ position: "absolute", top: "10%", left: "5%,", width: "400px", height: "400px", background: "var(--primary-glow)", borderRadius: "50%", filter: "blur(120px)", zIndex: -1 }}></div>
        <div style={{ position: "absolute", bottom: "10%", right: "5%,", width: "300px", height: "300px", background: "rgba(14, 165, 233, 0.05)", borderRadius: "50%", filter: "blur(100px)", zIndex: -1 }}></div>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--primary-glow)",
          border: "1px solid var(--border-hover)",
          padding: "8px 20px",
          borderRadius: "99px",
          color: "var(--primary)",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "32px",
          textTransform: "uppercase",
          letterSpacing: "1.5px"
        }}>
          <Sparkles size={14} />
          Revolutionizing Data Integrity
        </div>
        
        <h1 style={{
          fontSize: "clamp(56px, 12vw, 100px)",
          fontWeight: "800",
          margin: "0 0 8px",
          textAlign: "center",
          lineHeight: "0.9",
          letterSpacing: "-0.06em",
          textTransform: "uppercase"
        }}>
          <span className="gradient-text">NEURACLEAN</span>
        </h1>
        
        <h2 style={{
          fontSize: "clamp(24px, 5vw, 42px)",
          fontWeight: "700",
          margin: "0 0 32px",
          color: "var(--text-main)",
          textAlign: "center",
          letterSpacing: "-0.03em",
          fontFamily: "var(--font-outfit)"
        }}>
          Data Cleaning <span style={{ color: "var(--primary)" }}>Pipeline.</span>
        </h2>
        
        <p style={{
          fontSize: "clamp(18px, 4vw, 22px)",
          color: "var(--text-muted)",
          margin: "0 auto 60px",
          maxWidth: "750px",
          lineHeight: "1.6",
          textAlign: "center",
          fontWeight: "400"
        }}>
          The high-end forensic engine for automated data sanitization. 
          Upload raw datasets and witness instant, ML-driven optimization.
        </p>

        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <FileUpload />
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ padding: "100px 0", background: "linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.02), transparent)" }}>
        <div style={{ ...sectionStyle, padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h3 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "800", color: "var(--text-main)", margin: "0 0 16px" }}>Forensic Capabilities.</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>Engineered for mission-critical precision and industrial-scale data quality.</p>
          </div>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
            width: "100%"
          }}>
            {features.map((f, i) => (
              <div key={i} className="glass-effect card-hover" style={{
                borderRadius: "24px",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  background: "var(--primary-glow)", 
                  borderRadius: "14px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "var(--primary)",
                  border: "1px solid var(--border-light)"
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)", margin: "0 0 10px" }}>{f.title}</h4>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0, lineHeight: "1.7" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Footer Section */}
      <footer style={{ padding: "80px 24px 60px", textAlign: "center", borderTop: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--primary)" }}></div>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "var(--text-main)", letterSpacing: "-0.5px" }}>NEURA<span style={{ color: "var(--primary)" }}>CLEAN</span></span>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "14px", margin: "0 0 8px" }}>© 2026 Adaptive Intelligence Framework • Professional ML Solutions</p>
        <p style={{ color: "var(--text-dim)", fontSize: "12px", margin: 0 }}>Designed for Excellence • Built for Scale</p>
      </footer>

    </div>
  );
}

export default Home;