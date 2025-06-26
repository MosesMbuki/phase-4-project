import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Access the UserContext to get the fetchWithAuth function and currentUser
    const userContextValue = useContext(UserContext);
    // Check if context exists and has the properties we need
    if (!userContextValue) {
        throw new Error('RequestProvider must be wrapped in a UserProvider');
    }
    
    const { fetchWithAuth, currentUser } = userContextValue;


    // Fetch all requests for the current user
    const fetchUserRequests = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth('/requests/user');
            setRequests(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch requests');
            console.error('Request fetch error:', err);
        } finally {
            setLoading(false);
        }
    };
  
    // Fetch all requests (admin only)
    const fetchAllRequests = async () => {
        if (!currentUser?.is_admin) {
            setError('Access denied');
            return;
        }
        
        try {
            setLoading(true);
            const data = await fetchWithAuth('/requests');
            setRequests(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch all requests');
            console.error('Admin request fetch error:', err);
        } finally {
            setLoading(false);
        }
    };
  
    // Create a new request
    const createRequest = async (speakerName, manufacturer, reason) => {
      try {
        setLoading(true);
        const data = await fetchWithAuth('/requests/create_request', {
          method: 'POST',
          body: JSON.stringify({
            speaker_name: speakerName,
            manufacturer,
            reason
          })
        });
  
        setRequests(prev => [...prev, {
          id: data.id,
          speaker_name: speakerName,
          manufacturer,
          reason,
          status: 'Pending',
          request_date: new Date().toISOString(),
          user_id: currentUser.id
        }]);
  
        toast.success('Request created successfully!');
        return data;
      } catch (err) {
        setError(err.message || 'Failed to create request');
        toast.error(err.message || 'Failed to create request');
        throw err;
      } finally {
        setLoading(false);
      }
    };
  
    // Update a request (reason)
    const updateRequest = async (requestId, reason) => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/requests/${requestId}`, {
          method: 'PUT',
          body: JSON.stringify({ reason })
        });
  
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, reason } : req
        ));
  
        toast.success('Request updated successfully!');
        return data;
      } catch (err) {
        setError(err.message || 'Failed to update request');
        toast.error(err.message || 'Failed to update request');
        throw err;
      } finally {
        setLoading(false);
      }
    };
  
    // Delete a request (admin only)
    const deleteRequest = async (requestId) => {
      try {
        setLoading(true);
        await fetchWithAuth(`/requests/${requestId}`, {
          method: 'DELETE'
        });
  
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('Request deleted successfully!');
      } catch (err) {
        setError(err.message || 'Failed to delete request');
        toast.error(err.message || 'Failed to delete request');
        throw err;
      } finally {
        setLoading(false);
      }
    };
  
    // Update request status (admin only)
    const updateRequestStatus = async (requestId, status) => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/requests/${requestId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
  
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status } : req
        ));
  
        toast.success(`Request ${status} successfully!`);
        return data;
      } catch (err) {
        setError(err.message || `Failed to ${status} request`);
        toast.error(err.message || `Failed to ${status} request`);
        throw err;
      } finally {
        setLoading(false);
      }
    };
  
    // Clear errors
    const clearErrors = () => {
      setError(null);
    };
  
    // Effect to fetch user requests when the component mounts or user changes
    useEffect(() => {
        if (currentUser) {
            if (currentUser.is_admin) {
                fetchAllRequests();
            } else {
                fetchUserRequests();
            }
        }
    }, [currentUser]);
  
    return (
      <RequestContext.Provider
        value={{
          requests,
          loading,
          error,
          createRequest,
          updateRequest,
          deleteRequest,
          updateRequestStatus,
          fetchUserRequests,
          fetchAllRequests,
          clearErrors
        }}
      >
        {children}
      </RequestContext.Provider>
    );
  };
  
  export const useRequests = () => {
    const context = useContext(RequestContext);
    if (!context) {
      throw new Error('useRequests must be used within a RequestProvider');
    }
    return context;
};