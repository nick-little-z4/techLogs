// GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme?.font?.family || 'sans-serif'};
    background-color: ${({ theme }) => theme?.colors?.background || '#fff'};
    color: ${({ theme }) => theme?.colors?.text || '#000'};
  }

.App-header {
  background-color: ${({ theme }) => theme.colors.primary};  // still dark blue
  border-bottom: 4px solid ${({ theme }) => theme.colors.accentOrange};  // ← orange accent line
  padding: 20px;
  color: white;
}

.sign-out-button {
   background-color: ${({ theme }) => theme.colors.accentOrange}; // ← this uses your orange
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentOrange}; // ← this uses your orange
  }
}
`;

export default GlobalStyle;