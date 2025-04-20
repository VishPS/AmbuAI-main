import { useState } from "react";

function AmbulanceDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult("");
    setResultImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setResult("");
    setResultImage(null);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/detect", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.ambulance_detected) {
        setResult("🚑 Ambulance Detected!");
      } else {
        setResult("No Ambulance Detected.");
      }
      if (data.result_image) {
        setResultImage(`data:image/jpeg;base64,${data.result_image}`);
      }
    } catch (err) {
      setResult("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        background: "#181c23",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "2rem",
          width: "100%",
          maxWidth: "950px",
        }}
      >
        {/* Left: Upload Card */}
        <div
          style={{
            flex: 1,
            background: "#23272f",
            border: "2px solid #fff",
            borderRadius: "12px",
            padding: "2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "320px",
            minHeight: "420px",
          }}
        >
          <h3
            style={{
              color: "#fff",
              marginBottom: "1.5rem",
              fontWeight: "bold",
              fontSize: "1.2rem",
              letterSpacing: "0.5px",
            }}
          >
            Upload an Image:
          </h3>
          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                marginBottom: "1.2rem",
                color: "#fff",
                background: "#23272f",
                border: "1px solid #fff",
                borderRadius: "6px",
                padding: "0.5rem",
                width: "100%",
              }}
            />
            <button
              type="submit"
              disabled={loading || !selectedFile}
              style={{
                background: "#fff",
                color: "#23272f",
                border: "none",
                borderRadius: "6px",
                padding: "0.7rem 1.5rem",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: loading || !selectedFile ? "not-allowed" : "pointer",
                marginBottom: "1.5rem",
                transition: "background 0.2s",
                width: "100%",
              }}
            >
              {loading ? "Detecting..." : "Submit Image"}
            </button>
          </form>
          {result && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "8px",
                background: result.includes("Detected")
                  ? "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)"
                  : "#ffe0e0",
                color: result.includes("Detected") ? "#155724" : "#b71c1c",
                fontWeight: "bold",
                fontSize: "1.1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                width: "100%",
                textAlign: "center",
              }}
            >
              {result}
            </div>
          )}
          {resultImage && (
            <div style={{ marginTop: "1.5rem", width: "100%" }}>
              <img
                src={resultImage}
                alt="Detection Result"
                style={{
                  maxWidth: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #fff",
                }}
              />
            </div>
          )}
        </div>
        {/* Right: How It Works Card */}
        <div
          style={{
            flex: 1,
            background: "#23272f",
            border: "2px solid #fff",
            borderRadius: "12px",
            padding: "2rem 2rem",
            color: "#fff",
            minWidth: "320px",
            minHeight: "420px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "2rem",
              marginBottom: "1.2rem",
              color: "#fff",
              letterSpacing: "1px",
            }}
          >
            How It Works!
          </h2>
          <div style={{ fontSize: "1.08rem", lineHeight: "1.7" }}>
            <b>Our AI model analyzes images using a combination of techniques:</b>
            <ul style={{ marginTop: "1rem", marginBottom: "1rem", paddingLeft: "1.2rem" }}>
              <li style={{ marginBottom: "0.7rem" }}>
                <span style={{ color: "#00bfff", fontWeight: "bold" }}>● Color Detection:</span>
                <br />
                <span style={{ marginLeft: "1.2rem" }}>
                  Identifies typical ambulance colors (Red, White, Blue).
                </span>
              </li>
              <li style={{ marginBottom: "0.7rem" }}>
                <span style={{ color: "#ffb300", fontWeight: "bold" }}>▲ Shape Analysis:</span>
                <br />
                <span style={{ marginLeft: "1.2rem" }}>
                  Looks for vehicle-like shapes and aspect ratios.
                </span>
              </li>
              <li style={{ marginBottom: "0.7rem" }}>
                <span style={{ color: "#fff", fontWeight: "bold" }}>📝 Text Recognition (OCR):</span>
                <br />
                <span style={{ marginLeft: "1.2rem" }}>
                  Searches for keywords like "AMBULANCE", "EMS", "RESCUE".
                </span>
              </li>
              <li>
                <span style={{ color: "#00e676", fontWeight: "bold" }}>◆ Symbol Matching:</span>
                <br />
                <span style={{ marginLeft: "1.2rem" }}>
                  Detects common symbols like the Red Cross or Star of Life.
                </span>
              </li>
            </ul>
            <span>
              These features are combined to make a final prediction.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AmbulanceDetection;
