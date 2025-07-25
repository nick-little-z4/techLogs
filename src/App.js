import React, { useEffect, useState } from 'react';
import './App.css';

import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
import Navigation from './navigation/index';
import './assets/fonts/font.css'
import theme from './theme';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import exactaLogo from './assets/images/Exacta_Logo-01.png';

Amplify.configure(awsExports);

function App() {
  const [userGroups, setUserGroups] = useState([]);
  const [userAttributes, setUserAttributes] = useState({});

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const session = await fetchAuthSession();
        const idTokenPayload = session.tokens?.idToken?.payload;

        const groups = idTokenPayload?.["cognito:groups"] || [];
        setUserGroups(groups);

        // Optional: get email and other attributes
        const attributes = {
          email: idTokenPayload?.email,
          name: idTokenPayload?.name || idTokenPayload?.email,
        };
        setUserAttributes(attributes);

        console.log("✅ User groups:", groups);
        console.log("👤 User attributes:", attributes);
      } catch (error) {
        console.error("❌ Error fetching user groups:", error);
      }
    };
    fetchUserGroups();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div className="App">
        <Authenticator
          services={{
            async validateCustomSignUp(formData) {
              const email = formData.email || '';
              const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

              if (!emailPattern.test(email)) {
                return { email: 'Please enter a valid email address.' };
              }

              if (!email.endsWith('@exactasystems.com')) {
                return { email: 'Please enter a valid email address.' };
              }

              return {};
            },
          }}
        >
          {({ signOut }) => (
            <main className="App-main">
              <header className="App-header">
              <div className="top-bar">
              <img src={exactaLogo} alt="Logo" className="app-logo" />
            </div>
                {userGroups !== null && (
                  <Navigation
                    userGroups={userGroups}
                    userAttributes={userAttributes}
                  />
                )}
                <button onClick={signOut} className="sign-out-button">
                  Sign Out
                </button>
              </header>
              <div className="App-content">
                {/* Add routes or content here */}
              </div>
            </main>
          )}
        </Authenticator>
      </div>
    </ThemeProvider>
  );
}

// export default withAuthenticator(App);
export default App;
