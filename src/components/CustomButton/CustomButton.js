import React from 'react';
import './CustomButton.css';

const CustomButton = ({ onPress, text, type = 'PRIMARY', bgColor, fgColor }) => {
  const containerClass = `btn-container btn-${type.toLowerCase()}`;
  const textStyle = {
    color: fgColor || undefined,
  };

  const buttonStyle = {
    backgroundColor: bgColor || undefined,
  };

  return (
    <button
      className={containerClass}
      onClick={onPress}
      style={buttonStyle}
    >
      <span style={textStyle}>{text}</span>
    </button>
  );
};

export default CustomButton;