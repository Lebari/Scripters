import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";
import Sidebar from "./components/Sidebar.tsx";
import SignUp from "./pages/SignUp.tsx";
import Logout from "./pages/Logout.tsx";
import AuctionSearchDisplay from "./pages/AuctionSearchDisplay.tsx"; // Updated combined component
import ForwardBidding from "./pages/ForwardBidding.tsx";
import DutchBidding from "./pages/DutchBidding.tsx";
import Payment from "./pages/Payment.tsx";
import Receipt from "./pages/Receipt.tsx";
import AuctionEnded from "./pages/AuctionEnded.tsx";
import { useState, useEffect } from "react";
import axios from "axios";

import {useTokenContext} from "./components/TokenContext.tsx";
import Upload from "./pages/Upload.tsx";
import AuctionPage from "./pages/AuctionPage.tsx";
import UC7UpdateDutchPage from "./pages/UC7UpdateDutchPage.tsx";
import { NotificationProvider } from "./components/NotificationContext.tsx";
import NotificationCenter from "./components/NotificationCenter.tsx";
import { SocketProvider } from "./components/SocketContext.tsx";

function App() {
    //session tracking
    const {user, setUser, token} = useTokenContext();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const getUser = ()=>{
        axios({
            baseURL: "http://localhost:5001",
            url: "user",
            method: "get"
        }).then((result) => {
            console.log(result.data);
            setUser(result.data.user);
            console.log(`user retrieved? ${user.username}`)
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }
    
    useEffect(() => {
        getUser();
        
        // Check if mobile on initial load
        const checkMobile = () => {
            const isMobileView = window.innerWidth < 768;
            setIsMobile(isMobileView);
            // Close sidebar by default on mobile
            if (isMobileView) {
                setSidebarOpen(false);
            }
        };
        
        // Set initial value
        checkMobile();
        
        // Add resize listener
        window.addEventListener('resize', checkMobile);
        
        // Clean up
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, [token]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

  return (
    <NotificationProvider>
      <SocketProvider>
        <div className="min-h-screen flex flex-col md:flex-row bg-black text-gray-100">
            {/* Fixed header with user info and sidebar toggle - outside the flex structure */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-black-900 border-b border-gold/10 py-3 px-4 flex justify-between items-center shadow-md">
                {/* Toggle sidebar button */}
                <button 
                    className="p-2 bg-gold rounded-md text-black-800 hover:bg-gold-light transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-dark focus:ring-opacity-50"
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
                
                {/* User info moved to header */}
                <div className="ml-4 flex-1 text-center md:text-right">
                    <p className="text-sm md:text-base">
                        User: {user.username !== "" ? (
                            <span className="font-medium text-gold">{user.username}</span>
                        ) : (
                            <span className="text-gray-400">Guest</span>
                        )}
                    </p>
                </div>
            </div>
            
            {/* Sidebar - collapsible on all screen sizes */}
            <div 
                className={`fixed inset-y-0 left-0 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out z-30 bg-black-800 min-h-screen pt-[56px]`}
                style={{ width: "250px" }}
            >
                <Sidebar closeSidebar={toggleSidebar} />
            </div>

            {/* Main section */}
            <div 
                className="flex flex-col pb-16 px-4 md:px-8 gap-4 min-h-screen flex-grow bg-gradient-to-br from-black to-black-700 transition-all duration-300 ease-in-out ml-0"
                style={{ 
                    paddingTop: '72px',
                    marginLeft: sidebarOpen ? '250px' : '0',
                    width: sidebarOpen ? 'calc(100% - 250px)' : '100%',
                    transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                }}
            
                <Routes>
                    <Route index element={ <Catalog/> }/>
                    <Route path={import.meta.env.VITE_APP_CATALOG_URL} element={ <Catalog/> }/>
                    <Route path={`${import.meta.env.VITE_APP_CATALOG_URL}/:name`} element={<AuctionPage />} />
                    <Route path={import.meta.env.VITE_APP_SIGNUP_URL} element={ <SignUp/> }/>
                    <Route path={import.meta.env.VITE_APP_LOGIN_URL} element={ <Login/> }/>
                    <Route path={import.meta.env.VITE_APP_LOGOUT_URL} element={ <Logout/> }/>
                    <Route path={import.meta.env.VITE_APP_UPLOAD_URL} element={ <Upload/> }/>
                    <Route path={import.meta.env.VITE_APP_UC5PAY_URL} element={<Payment />} />

                    {/* Combined Auction Search & Display Page */}
                    <Route path={import.meta.env.VITE_APP_SEARCH_URL} element={<AuctionSearchDisplay />}/>
                    {/* Forward Auction Bidding Page */}
                    <Route path={import.meta.env.VITE_APP_UC31FWDBIDDING_URL} element={<ForwardBidding />} />
                    {/* Dutch Auction Bidding Page */}
                    <Route path={import.meta.env.VITE_APP_UC32DCHBIDDING_URL} element={<DutchBidding />} />
                    {/* Auction Ended Page */}
                    <Route path="/auction-ended" element={<AuctionEnded />} />

                    <Route path={import.meta.env.VITE_APP_UPDATE_URL} element={<UC7UpdateDutchPage />} />
                    <Route path={import.meta.env.VITE_APP_UC6RECEIPT_URL} element={<Receipt />} />
                </Routes>
            </div>

            {/* Notification Center */}
            <NotificationCenter />
            
            {/* Overlay when sidebar is open on mobile */}
            {sidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
      </SocketProvider>
    </NotificationProvider>
  )
}

export default App;
