import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'meetingmind_token';
const API_BASE_URL = 'http://localhost:8080/api';

async function authRequest(path, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);

    const response = await fetch(API_BASE_URL + path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Server-Fehler: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [loading, setLoading] = useState(true);

    const isAuthenticated = Boolean(token && currentUser);

    async function loadCurrentUser() {
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (!storedToken) {
            setCurrentUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        try {
            const user = await authRequest('/auth/me');
            setCurrentUser({
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            });
            setToken(storedToken);
        } catch (error) {
            console.error('User konnte nicht geladen werden:', error);
            localStorage.removeItem(TOKEN_KEY);
            setCurrentUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const response = await authRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email.trim(),
                password,
            }),
        });

        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setCurrentUser({
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: response.role,
        });

        return response;
    }

    async function register(name, email, password) {
        const response = await authRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                password,
            }),
        });

        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setCurrentUser({
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: response.role,
        });

        return response;
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setCurrentUser(null);
    }

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const value = useMemo(
        () => ({
            currentUser,
            token,
            loading,
            isAuthenticated,
            login,
            register,
            logout,
            loadCurrentUser,
        }),
        [currentUser, token, loading, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden.');
    }

    return context;
}