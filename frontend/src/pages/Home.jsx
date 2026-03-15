import FileUpload from "../components/FileUpload";

function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 20px",
      minHeight: "100vh",
      background: "transparent",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorators */}
      <div style={{
        position: "absolute",
        top: "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "600px",
        background: "radial-gradient(ellipse at center, rgba(168, 85, 247, 0.2) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "800px", marginBottom: "40px" }}>

        <h1 style={{
          fontSize: "56px",
          fontWeight: "800",
          margin: "0 0 16px",
          background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: "1.2"
        }}>
          Intelligent Data Cleaning
        </h1>
        <p style={{
          fontSize: "20px",
          color: "var(--text-muted)",
          margin: "0",
          lineHeight: "1.6",
          fontWeight: "400"
        }}>
          Upload your raw CSV, and let our ML pipeline handle missing values, anomalies, and dirty formatting automatically in seconds.
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "850px" }}>
        <FileUpload />
      </div>
    </div>
  );
}

export default Home;