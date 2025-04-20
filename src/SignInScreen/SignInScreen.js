import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CustomInput from "../components/Input";
import CustomButton from "../components/CustomButton";
import SocialSignInButtons from "../components/SocialSignInButtons";

import Logo from "../assets/images/Logo_1.png";

import "./SignInScreen.css";

const SignInScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [windowHeight, setWindowHeight] = useState(600); // fallback default height
  const navigate = useNavigate();

  

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
  
    // Delay until after initial render
    if (typeof window !== "undefined") {
      handleResize(); // set initial value
      window.addEventListener("resize", handleResize);
    }
  
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  const onSignInPressed = () => navigate("/home");
  const onForgotPasswordPressed = () => navigate("/forgot-password");
  const onSignUpPressed = () => navigate("/signup");

  return (
    <div className="signin-container">
      <img
        src={Logo}
        alt="Logo"
        className="signin-logo"
        style={{ height: windowHeight * 0.3 }}
      />
      
      <CustomInput
        placeholder="Username"
        value={username}
        setValue={setUsername}
        secureTextEntry={false}
      />
      <CustomInput
        placeholder="Password"
        value={password}
        setValue={setPassword}
        secureTextEntry
      />
      <CustomButton text="Sign In" onPress={onSignInPressed} />
      <CustomButton
        text="Forgot Password?"
        onPress={onForgotPasswordPressed}
        type="TERTIARY"
      />
      <SocialSignInButtons />
      <CustomButton
        text="Don't have an account? Create one"
        onPress={onSignUpPressed}
        type="TERTIARY"
      />
    </div>

    
  );
};

export default SignInScreen;