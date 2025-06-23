import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import Home from './pages/Home';
import Speakers from './pages/Speakers';
import SingleSpeaker from './pages/SingleSpeaker';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Users from './pages/Users';
import AddRequests from './pages/AddRequests';
import { UserProvider } from './context/UserContext';
import { RequestProvider } from './context/RequestContext';
import {ReviewProvider} from './context/ReviewContext';

function App() {
    return (
        <BrowserRouter>
        
            <UserProvider>
                <RequestProvider>
                    <ReviewProvider>
                        
                <Routes>
                        <Route path="/" exact component={Home} />
                        <Route path="/speakers" component={Speakers} />
                        <Route path="/speakers/:id" component={SingleSpeaker} />
                        <Route path="/users" component={Users} />
                        <Route path="/register" component={Register} />
                        <Route path="/add-requests" component={AddRequests} />
                        <Route path="/layout" component={Layout} />
                        <Route path="/about" component={About} />
                        <Route path="/login" component={Login} />
                        <Route path="/profile" component={Profile} />
                        </Routes>
                        
                        </ReviewProvider >
                        </RequestProvider>
            </UserProvider>
        </BrowserRouter>
  );
}
export default App;