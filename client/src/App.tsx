import { Theme } from '@twilio-paste/core/theme';
import * as React from 'react';
import "./App.css";

const App: React.FC = ({ children }) => {
  return <Theme.Provider theme="default">{children}</Theme.Provider>;
};

export default App;
