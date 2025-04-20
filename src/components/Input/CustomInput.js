import React from "react";
import "./CustomInput.css"; // style moved to CSS for web

const CustomInput = ({ value, setValue, placeholder, secureTextEntry }) => {
  return (
    <div className="input-container">
      <input
        type={secureTextEntry ? "password" : "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
};

export default CustomInput;