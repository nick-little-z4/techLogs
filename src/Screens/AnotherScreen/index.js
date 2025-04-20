import React from "react";
import { useNavigate } from "react-router-dom";

const AnotherScreen = () => {
  const navigate = useNavigate();

  const goBackHome = () => {
    navigate("/"); // or "/" if that's your home route
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1 style={{ fontSize: "24px" }}>Made it to screen 2</h1>
      <button
        onClick={goBackHome}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Go Back Home
      </button>
    </div>
  );
};

export default AnotherScreen;