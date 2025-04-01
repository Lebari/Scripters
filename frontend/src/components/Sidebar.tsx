import React, { memo } from "react";
import { NavLink } from "react-router-dom";

interface SidebarLink {
    name: string;
    href: string;
}

interface SidebarProps {
    closeSidebar?: () => void;
}

const sidebarItems: SidebarLink[] = [
    { name: "UC1.1: Sign Up", href: import.meta.env.VITE_APP_SIGNUP_URL },
    { name: "UC1.2: Login", href: import.meta.env.VITE_APP_LOGIN_URL },
    { name: "UC1: Logout", href: import.meta.env.VITE_APP_LOGOUT_URL },
    { name: "UC2: Browse Catalogue of Auctions", href: import.meta.env.VITE_APP_SEARCH_URL },
    { name: "UC3.1: Forward Auction Bidding", href: import.meta.env.VITE_APP_UC31FWDBIDDING_URL },
    { name: "UC3.2: Dutch Auction Bidding", href: import.meta.env.VITE_APP_UC32DCHBIDDING_URL },
    { name: "UC4: Auction Ended", href: import.meta.env.VITE_APP_UC4END_URL },
    { name: "UC5: Payment", href: import.meta.env.VITE_APP_UC5PAY_URL },
    { name: "UC6: Receipt Page", href: import.meta.env.VITE_APP_UC6RECEIPT_URL },
    { name: "UC7: Sell Item", href: import.meta.env.VITE_APP_UPLOAD_URL },
    { name: "UC7: Update Dutch Auction", href: import.meta.env.VITE_APP_UPDATE_URL },
];

const Sidebar: React.FC<SidebarProps> = memo(({ closeSidebar }) => {
    const handleLinkClick = () => {
        // Close sidebar on link click for mobile devices
        if (window.innerWidth < 768 && closeSidebar) {
            closeSidebar();
        }
    };

    return (
        <aside className="w-[250px] min-h-screen bg-black-800 pt-16 px-4 border-r border-gold-dark/20 overflow-y-auto shadow-lg" aria-label="Sidebar">
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-gold to-gold-dark rounded-full mr-2"></div>
                    <h2 className="text-xl font-bold text-gold">Menu</h2>
                </div>
                
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 mr-1 hidden md:inline">Hide Menu</span>
                    <button 
                        className="p-2 rounded-full hover:bg-black-700 text-gold-light transition-colors"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Page Links */}
            <nav className="mt-8">
                <ul className="flex flex-col gap-2">
                    {sidebarItems.map((link) => (
                        <li
                            key={link.name}
                            className="w-full">
                            <NavLink
                                to={link.href}
                                onClick={handleLinkClick}
                                className={({ isActive}) =>
                                    `flex w-full px-4 py-2 rounded-md transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-gold-dark/20 to-gold-light/10 text-gold border-l-2 border-gold' 
                                            : 'hover:bg-black-700 text-gray-400 hover:text-gold-light'
                                    }`
                            }>
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-8 pb-6 px-2">
                <div className="border-t border-gray-800 pt-4 mt-6">
                    <p className="text-xs text-gray-500 text-center">
                        Scripters Auction Platform
                    </p>
                </div>
            </div>
        </aside>
    );
});

export default Sidebar;
