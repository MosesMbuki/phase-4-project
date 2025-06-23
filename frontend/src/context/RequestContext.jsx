import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { UserContext } from './UserContext';
import { api_url } from '../config.json';

export const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
    const navigate = useNavigate();
    
    const { currentUser, auth_token } = useContext(UserContext);
    const [requests, setRequests] = useState([]);

    // Function to fetch all requests only for admins
    function fetchRequests() {
        if (!currentUser || !currentUser.is_admin) {
            toast.error("You do not have permission to view requests.");
            return;
        }

        setLoading(true);
        fetch(`${api_url}/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth_token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    setRequests(data);
                    toast.success("Requests fetched successfully.");
                }
            })
            .catch(error => {
                console.error("Error fetching requests:", error);
                toast.error("An error occurred while fetching requests.");
            })
            .finally(() => setLoading(false));
    };

    // Function to add a new request
    function addRequest(requestData) {
        if (!currentUser) {
            toast.error("You must be logged in to add a request.");
            return;
        }

        useEffect(() => {
            if (currentUser) {
                fetchRequests();
            }
        }, [currentUser]);

        return (
            <RequestContext.Provider value={{ requests, loading, fetchRequests }}>
                {children}
            </RequestContext.Provider>
        );
    };
}