import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import Home from './pages/Home';
import SignInUpForm from './pages/SignInUpForm';
import Layout from './components/Layout';
import { UserProvider } from './context/UserContext';


function App() {
    return (
        <BrowserRouter>
        
            <UserProvider>
                {/* <RequestProvider> */}
                    {/* <ReviewProvider> */}
                        
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="home" element={<Home />} />
                        <Route path="signup" element={<SignInUpForm />} />
                    </Route>
                </Routes>
                        
                        {/* </ReviewProvider > */}
                        {/* </RequestProvider> */}
            </UserProvider>
        </BrowserRouter>
  );
}
export default App;