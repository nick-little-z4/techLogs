// GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'URW DIN Condensed';
  }

.App-header {
  background-color: #FFFFFF;
/*  border-top: 4px solid #FF5A1E;
  border-right: 4px solid #FF5A1E;
  border-left: 4px solid #FF5A1E;
  border-bottom: 4px solid #FF5A1E; */
  padding: 35px;
}

.sign-out-button {
  background-color: #0A0A5A;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
`;

export default GlobalStyle;