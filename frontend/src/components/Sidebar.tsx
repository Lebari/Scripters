import React, { memo } from "react";
import { NavLink } from "react-router-dom";

interface SidebarLink {
    name: string;
    href: string;
}

const sidebarItems: SidebarLink[] = [
    { name: "UC1.1: Sign Up", href: import.meta.env.VITE_APP_SIGNUP_URL },
    { name: "UC1.2: Login", href: import.meta.env.VITE_APP_LOGIN_URL },
    { name: "UC1: Logout", href: import.meta.env.VITE_APP_LOGOUT_URL },
    { name: "UC2: Browse Catalogue of Auctions", href: import.meta.env.VITE_APP_CATALOG_URL },
    { name: "UC3.1: Forward Auction Bidding", href: import.meta.env.VITE_APP_UC31FWDBIDDING_URL },
    { name: "UC3.2: Dutch Auction Bidding", href: import.meta.env.VITE_APP_UC32DCHBIDDING_URL },
    { name: "UC4: Auction Ended", href: import.meta.env.VITE_APP_UC4END_URL },
    { name: "UC5: Payment", href: import.meta.env.VITE_APP_UC5PAY_URL },
    { name: "UC6: Receipt Page", href: import.meta.env.VITE_APP_UC6RECEIPT_URL },
    { name: "UC7: Sell Item", href: import.meta.env.VITE_APP_UPLOAD_URL },
    { name: "UC7: Update Dutch Auction", href: import.meta.env.VITE_APP_UPDATE_URL },
];

const Sidebar: React.FC = memo(() => {
    const liStyle = "flex w-full text-left";

    return (
        <aside className="w-[200px] h-auto grid grid-cols-1 gap-1 pl-4 pr-4 place-items-start" aria-label="Sidebar"
        >
            <p className={"mb-2"}>Menu</p>

            {/* Page Links */}
            <ul>
                {sidebarItems.map((link) => (
                    <li
                        key={link.name}
                        className={"mb-2 hover:p-2 hover:font-medium hover:border list-none"}>
                        <NavLink
                            to={link.href}
                            className={({ isActive}) =>
                                isActive ? `${liStyle} text-white` : `${liStyle}`
                        }>
                            {link.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    );

});

export default Sidebar;
