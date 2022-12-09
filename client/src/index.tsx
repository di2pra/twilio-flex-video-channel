import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { Loading } from './components/Loading';
import { PageLayout } from './components/PageLayout';
import { Home } from './pages/Home';
import { VideoCall } from './pages/VideoCall';

export const Index: React.FC = () => {
  return (
    <App>
      <React.Suspense fallback={<Loading />}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PageLayout />}>
              <Route index element={<Home />} />
              <Route path="video/:sid" element={<VideoCall />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </React.Suspense>
    </App>
  );
};

ReactDOM.render(
  <Index />,
  document.querySelector('#root')
);