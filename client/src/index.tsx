import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import { Loading } from './components/Loading';
import { PageLayout } from './components/PageLayout';
import { Home } from './pages/Home';
import { Interaction } from './pages/Interaction';

export const Index: React.FC = () => {
  return (
    <App>
      <React.Suspense fallback={<Loading />}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<PageLayout />}>
              <Route index element={<Home />} />
              <Route
                path="interaction/new/WithVideo"
                element={<Home startInteraction={true} isWithVideo />}
              />
              <Route
                path="interaction/new"
                element={<Home startInteraction={true} />}
              />
              <Route
                path="interaction/:conversationSid"
                element={<Interaction />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </React.Suspense>
    </App>
  );
};

ReactDOM.render(<Index />, document.querySelector("#root"));
