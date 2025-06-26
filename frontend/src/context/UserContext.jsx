import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api_url } from '../config.json';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [auth_token, setAuthToken] = useState(() => localStorage.getItem("access_token"));
    const [isLoading, setIsLoading] = useState(false);

    // Enhanced fetch function with authentication
    const fetchWithAuth = useCallback(async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (auth_token) {
            headers['Authorization'] = `Bearer ${auth_token}`;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${api_url}${url}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error messages from backend
                const errorMsg = data.error || data.msg || `HTTP error! status: ${response.status}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            toast.error(error.message || 'An error occurred');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [auth_token]);

    // ========= User Registration ==========
    const register_user = async (username, email, password) => {
        try {
            toast.loading('Registering user...');
            const res = await fetch(`${api_url}/users`, {  // Fixed URL (removed 'api_url' string)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();
            toast.dismiss();

            if (!res.ok) {
                toast.error(data.error || 'Registration failed');
                return { success: false, error: data.error };
            }

            toast.success(data.success || 'Registration successful!');
            navigate('/login');
            return { success: true };
        } catch (error) {
            toast.dismiss();
            return { success: false, error: error.message };
        }
    };

    // ========= User Login ==========
    const login_user = async (email, password) => {
        try {
            toast.loading('Logging in...');
            const res = await fetch(`${api_url}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            toast.dismiss();

            if (!res.ok) {
                toast.error(data.error || 'Login failed');
                return { success: false, error: data.error };
            }

            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                setAuthToken(data.access_token);
                toast.success('Logged in successfully!');
                navigate('/');  // Changed from '/questions' to more generic '/'
                return { success: true };
            }

            toast.error('Invalid response from server');
            return { success: false, error: 'Invalid response' };
        } catch (error) {
            toast.dismiss();
            return { success: false, error: error.message };
        }
    };

    // ========= User Logout ==========
    const logout_user = async () => {
        try {
            if (!auth_token) {
                // If no token, just clear local state
                localStorage.removeItem('access_token');
                setAuthToken(null);
                setCurrentUser(null);
                navigate('/login');
                return { success: true };
            }

            toast.loading('Logging out...');
            const res = await fetchWithAuth('/logout', {
                method: 'DELETE',
            });

            toast.dismiss();
            localStorage.removeItem('access_token');
            setAuthToken(null);
            setCurrentUser(null);
            toast.success(res.success || 'Logged out successfully!');
            navigate('/login');
            return { success: true };
        } catch (error) {
            toast.dismiss();
            // Even if API fails, clear local auth
            localStorage.removeItem('access_token');
            setAuthToken(null);
            setCurrentUser(null);
            navigate('/login');
            return { success: false, error: error.message };
        }
    };

    // ========= Update User Profile ==========
    const update_user_profile = async (username, email, password, newPassword) => {
        try {
            toast.loading('Updating profile...');
            const res = await fetchWithAuth('/update_user', {
                method: 'PATCH',
                body: JSON.stringify({ username, email, password, newPassword }),
            });

            toast.dismiss();
            
            if (res.error) {
                toast.error(res.error);
                return { success: false, error: res.error };
            }

            // Update current user in state
            if (res.success) {
                setCurrentUser(prev => ({
                    ...prev,
                    username,
                    email
                }));
            }

            toast.success(res.success || 'Profile updated successfully!');
            return { success: true };
        } catch (error) {
            toast.dismiss();
            return { success: false, error: error.message };
        }
    };

    // ========= Delete User Profile ==========
    const delete_profile = async () => {
        try {
            toast.loading('Deleting profile...');
            const res = await fetchWithAuth('/delete_user_profile', {
                method: 'DELETE',
            });

            toast.dismiss();
            localStorage.removeItem('access_token');
            setAuthToken(null);
            setCurrentUser(null);
            toast.success(res.success || 'Profile deleted successfully!');
            navigate('/login');
            return { success: true };
        } catch (error) {
            toast.dismiss();
            return { success: false, error: error.message };
        }
    };

    // ========= Get Current User ==========
    const fetchCurrentUser = useCallback(async () => {
        if (!auth_token) {
            setCurrentUser(null);
            return;
        }

        try {
            setIsLoading(true);
            const user = await fetchWithAuth('/current_user');
            
            if (user.error) {
                toast.error(user.error);
                logout_user();
            } else {
                setCurrentUser(user);
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            logout_user();
        }
    }, [auth_token, fetchWithAuth]);

    // Auto-fetch user when token changes
    useEffect(() => {
        fetchCurrentUser();
    }, [auth_token, fetchCurrentUser]);

    // Context value
    const context_data = {
        auth_token,
        currentUser,
        isLoading,
        register_user,
        login_user,
        logout_user,
        update_user_profile,
        delete_profile,
        fetchCurrentUser,
        fetchWithAuth,  // Expose fetchWithAuth for other components to use
    };

    return (
        <UserContext.Provider value={context_data}>
            <Toaster position="top-center" />
            {children}
        </UserContext.Provider>
    );
};