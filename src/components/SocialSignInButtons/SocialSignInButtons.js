import React from "react";
import CustomButton from "../CustomButton/CustomButton";

const onSignInFacebook = () => {
  console.warn("Sign in with Facebook");
};

const onSignInGoogle = () => {
  console.warn("Sign in with Google");
};

const onSignInApple = () => {
  console.warn("Sign in with Apple");
};

const SocialSignInButtons = () => {
  return (
    <div style={{ width: '100%' }}>
      <CustomButton
        text="Sign In with Facebook"
        onPress={onSignInFacebook}
        bgColor="#E7EAF4"
        fgColor="#4765A9"
      />
      <CustomButton
        text="Sign In with Google"
        onPress={onSignInGoogle}
        bgColor="#FAE9EA"
        fgColor="#DD4D44"
      />
      <CustomButton
        text="Sign In with Apple"
        onPress={onSignInApple}
        bgColor="#e3e3e3"
        fgColor="#363636"
      />
    </div>
  );
};

export default SocialSignInButtons;