import React from "react";

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#0d0f1a",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 99999,
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100px",
          height: "100px",
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            width: "80px",
            height: "80px",
            border: "4px solid transparent",
            borderTopColor: "#00f2fe",
            borderBottomColor: "#4facfe",
            borderRadius: "50%",
            animation: "spin 1.5s linear infinite",
            position: "absolute",
          }}
        />
        {/* Inner Ring */}
        <div
          style={{
            width: "55px",
            height: "55px",
            border: "4px solid transparent",
            borderLeftColor: "#ff007f",
            borderRightColor: "#7f00ff",
            borderRadius: "50%",
            animation: "spin-reverse 1s linear infinite",
            position: "absolute",
          }}
        />
        {/* Center Glow */}
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: "#00f2fe",
            borderRadius: "50%",
            boxShadow: "0 0 25px #00f2fe, 0 0 50px #ff007f",
            position: "absolute",
          }}
        />
      </div>
      <p
        style={{
          marginTop: "24px",
          fontSize: "16px",
          fontWeight: "600",
          color: "#e2e8f0",
          letterSpacing: "2px",
          textTransform: "uppercase",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        Loading...
      </p>

      {/* Inject Keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;