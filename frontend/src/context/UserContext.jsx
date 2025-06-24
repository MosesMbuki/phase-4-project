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

    // Fetch function with authentication
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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
            const res = await fetchWithAuth('api_url/users', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });

            toast.dismiss();
            if (res.error) {
                toast.error(res.error);
                return { success: false, error: res.error };
            }

            toast.success(res.success || 'Registration successful!');
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
            const res = await fetchWithAuth('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            toast.dismiss();
            if (res.error) {
                toast.error(res.error);
                return { success: false, error: res.error };
            }

            if (res.access_token) {
                localStorage.setItem('access_token', res.access_token);
                setAuthToken(res.access_token);
                toast.success('Logged in successfully!');
                navigate('/questions');
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
            toast.loading('Logging out...');
            const res = await fetchWithAuth('/logout', {
                method: 'DELETE',
            });

            toast.dismiss();
            if (res.success) {
                localStorage.removeItem('access_token');
                setAuthToken(null);
                setCurrentUser(null);
                toast.success(res.success || 'Logged out successfully!');
                navigate('/login');
                return { success: true };
            }

            toast.error(res.error || 'Failed to logout');
            return { success: false, error: res.error };
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
            if (res.success) {
                localStorage.removeItem('access_token');
                setAuthToken(null);
                setCurrentUser(null);
                toast.success(res.success || 'Profile deleted successfully!');
                navigate('/login');
                return { success: true };
            }

            toast.error(res.error || 'Failed to delete profile');
            return { success: false, error: res.error };
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
            if (user.msg) {
                toast.error(user.msg);
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

    // Auto-logout when token expires
    useEffect(() => {
        const checkAuth = () => {
            if (auth_token && currentUser) {
                // You might want to add token expiration check here
            }
        };

        const interval = setInterval(checkAuth, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [auth_token, currentUser]);

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
        fetchCurrentUser, // Expose if needed for manual refresh
    };

    return (
        <UserContext.Provider value={context_data}>
            <Toaster position="top-center" />
            {children}
        </UserContext.Provider>
    );
};