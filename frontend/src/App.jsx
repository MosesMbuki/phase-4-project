import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignInUpForm from './pages/SignInUpForm';
import Layout from './components/Layout';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="auth" element={<SignInUpForm />} />
            {/* Add other routes as needed */}
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;