import React, { useState } from "react";
import { uploadFile } from "./api";
import styles from "./App.module.css";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setStatus("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    // Check file type
    const allowedTypes = ['pdf', 'txt', 'docx', 'md'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setStatus("Unsupported file type. Please upload PDF, TXT, DOCX, or MD files.");
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setStatus("File too large. Please upload files smaller than 10MB.");
      return;
    }

    setUploading(true);
    setStatus("Uploading...");
    setProgress(0);

    try {
      const response = await uploadFile(file, (progressPercent) => {
        setProgress(progressPercent);
        setStatus(`Uploading... ${progressPercent}%`);
      });

      setStatus(`✅ ${response.message || "Upload successful!"}`);
      setFile(null);
      setProgress(100);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setStatus("");
        setProgress(0);
      }, 5000);

    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.detail || "Upload failed. Please try again.";
      setStatus(`❌ ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusClass = () => {
    if (status.includes("✅")) return styles.success;
    if (status.includes("❌")) return styles.error;
    if (uploading) return styles.uploading;
    return "";
  };

  return (
    <div className={styles.uploadContainer}>
      <h3 className={styles.uploadTitle}>Upload Documents</h3>
      <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
        Upload PDF, TXT, DOCX, or Markdown files to add them to the knowledge base.
      </p>
      
      <div className={styles.uploadForm}>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.txt,.docx,.md"
          onChange={handleFileChange}
          className={styles.fileInput}
          disabled={uploading}
        />
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className={styles.uploadBtn}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      
      {file && (
        <div style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
          <strong>Selected:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
      
      {progress > 0 && progress < 100 && (
        <div style={{ marginTop: "12px" }}>
          <div style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#4caf50",
              transition: "width 0.3s ease"
            }}></div>
          </div>
        </div>
      )}
      
      {status && (
        <div className={`${styles.uploadStatus} ${getStatusClass()}`}>
          {status}
        </div>
      )}
      
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
        <strong>Supported formats:</strong> PDF, TXT, DOCX, MD | <strong>Max size:</strong> 10MB
      </div>
    </div>
  );
}

export default FileUpload;
