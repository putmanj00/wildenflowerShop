import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShopifyCustomer } from '../types/shopify';
import { getCustomer, logoutCustomer } from '../lib/shopify-auth';

interface AuthContextType {
    customer: ShopifyCustomer | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshCustomer: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    customer: null,
    isAuthenticated: false,
    isLoading: true,
    refreshCustomer: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCustomer = async () => {
        setIsLoading(true);
        try {
            // getCustomer automatically uses the stored token if no token is passed
            const response = await getCustomer();
            if (response.data) {
                setCustomer(response.data);
            } else {
                setCustomer(null);
            }
        } catch (error) {
            console.error('Error hydrating customer session:', error);
            setCustomer(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, []);

    const refreshCustomer = async () => {
        await fetchCustomer();
    };

    const logout = async () => {
        await logoutCustomer();
        setCustomer(null);
    };

    return (
        <AuthContext.Provider
            value={{
                customer,
                isAuthenticated: !!customer,
                isLoading,
                refreshCustomer,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
