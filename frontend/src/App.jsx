import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Speakers from './pages/Speakers';
import About from './pages/About';
import SpeakerDetailPage from './pages/SpeakerDetailPage';
import Request from './pages/Request';
import SignInUpForm from './pages/SignInUpForm';
import Layout from './components/Layout';
import Profile from './pages/Profile';
import { UserProvider } from './context/UserContext';
import { RequestProvider } from './context/RequestContext';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <RequestProvider>
        <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="request" element={<Request />} />
            <Route path="home" element={<Home />} />
            <Route path="auth" element={<SignInUpForm />} />
            <Route path="profile" element={<Profile />} />
            <Route path="speakers" element={<Speakers />} />
            <Route path="speakers/:id" element={<SpeakerDetailPage />} />
              <Route path="about" element={<About/>} />
            {/* Add other routes as needed */}
          </Route>
          </Routes>
          </RequestProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;