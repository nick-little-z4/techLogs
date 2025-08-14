import React, { useEffect, useState } from 'react';
import './App.css';

import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
import Navigation from './navigation/index';
import './assets/fonts/font.css';
import theme from './theme';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import exactaLogo from './assets/images/Exacta_Logo-01.png';

Amplify.configure({
  ...awsExports,
  Auth: {
    ...awsExports.Auth,
    mandatorySignIn: true,
  },
});

function App() {
  const [userGroups, setUserGroups] = useState(null);
  const [userAttributes, setUserAttributes] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handlePostLogin = async () => {
    try {
      const session = await fetchAuthSession();
      const idTokenPayload = session.tokens?.idToken?.payload;

      const groups = idTokenPayload?.['cognito:groups'] || [];
      setUserGroups(groups);

      const attributes = {
        email: idTokenPayload?.email,
        name: idTokenPayload?.name || idTokenPayload?.email,
      };
      setUserAttributes(attributes);

      console.log('✅ User groups:', groups);
      console.log('✅ Attributes:', attributes);
    } catch (err) {
      console.error('❌ Error during session fetch:', err);
    }
  };

  // when currentUser changes, fetch details
  useEffect(() => {
    if (currentUser) {
      handlePostLogin();
    }
  }, [currentUser]);

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
          {({ signOut, user }) => {
            // This is *render only*, not state change
            if (user && user !== currentUser) {
              // Schedule state update AFTER render
              Promise.resolve().then(() => setCurrentUser(user));
            }

            return (
              <main className="App-main">
                <header className="App-header">
                  <div className="top-bar">
                    <img src={exactaLogo} alt="Logo" className="app-logo" />
                  </div>

                  {userGroups && userAttributes ? (
                    <Navigation
                      userGroups={userGroups}
                      userAttributes={userAttributes}
                    />
                  ) : (
                    <p style={{ color: '#fff' }}>Loading user info...</p>
                  )}

                  <button onClick={signOut} className="sign-out-button">
                    Sign Out
                  </button>
                </header>

                <div className="App-content">
                  {/* Add routes or content here */}
                </div>
              </main>
            );
          }}
        </Authenticator>
      </div>
    </ThemeProvider>
  );
} export default App;