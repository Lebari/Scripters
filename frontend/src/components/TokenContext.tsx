import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from "axios";
import {User} from "../models.ts";

// Define the type of the context
interface TokenContextType {
    token: string | null;
    setToken: (token: string) => void;
    removeToken: () => void;
    user: User;
    setUser: (u: User) => void;
    removeUser: () => void;
    userType: string | null;
    setUserType: (type: string) => void;
}

// Create the context
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// Create the provider component
export const TokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const defaultUser: User = {
        id: "",
        fname: "",
        lname: "",
        username: "",
        password: "",

        is_seller: false,
        streetno: 1,
        street: "",
        city: "",
        country: "",
        postal: "",

        broker: "",
        cards: [""],
        sales: [""],
        purchases: [""],
        subscriptions: [""],
        auctions: [""]}

    const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUserState] = useState<User>(defaultUser);
    const [userType, setUserTypeState] = useState<string | null>(() => localStorage.getItem('userType'));
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`; //add authorization to header by default

    const setToken = (newToken: string) => {
        setTokenState(newToken);
        localStorage.setItem('token', newToken);
    };

    const setUser = (newUser: User) => {
        setUserState(newUser);
    };

    const removeToken = () => {
        setTokenState(null);
        setUserType("user");
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
    };

    const removeUser = () => {
        setUserState(defaultUser);
        removeToken();
    };

    const setUserType = (type: string) => {
        if(type === "user" || type === "seller"){
            setUserTypeState(type);
            localStorage.setItem('userType', type);
        }else{
            console.log("Incorrect user type")
        }
    };

    return (
        <TokenContext.Provider value={{ token, setToken, removeToken, user, setUser, removeUser, setUserType, userType }}>
            {children}
        </TokenContext.Provider>
    );
};

// Create a custom hook for using the TokenContext
export const useTokenContext = (): TokenContextType => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error('useTokenContext must be used within a TokenProvider');
    }
    return context;
};