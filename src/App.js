import React, { useEffect, useState } from 'react';
import './App.css';

import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
import Navigation from './navigation/index';

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
    <div className="App">
      <Authenticator>
        {({ signOut }) => (
          <main className="App-main">
            <header className="App-header">
              <button
                onClick={signOut}
                className="sign-out-button"
              >
                Sign Out
              </button>
              {userGroups !== null && (
                <Navigation userGroups={userGroups} userAttributes={userAttributes} />
              )}
            </header>
            <div className="App-content">
              {/* Your expanding content like SiteTotals */}
              {/* <SiteTotals /> */}
            </div>
          </main>
        )}
      </Authenticator>
    </div>
  );
}

export default withAuthenticator(App);