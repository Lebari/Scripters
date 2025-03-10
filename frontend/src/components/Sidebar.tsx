import React, { memo } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";

interface SidebarLink {
  name: string;
  href?: string;
}

const sidebarItems: SidebarLink[] = [
  { name: "UC1.1: Sign Up", href: import.meta.env.VITE_APP_SIGNUP_URL || "/signup" },
  { name: "UC1.2: Login", href: import.meta.env.VITE_APP_LOGIN_URL || "/login" },
  { name: "UC1: Logout", href: import.meta.env.VITE_APP_LOGOUT_URL || "/logout" },
  { name: "UC2:  Browse Catalogue of Auctioned Items", href: import.meta.env.VITE_APP_SEARCH_URL || "/item-search" },
  { name: "UC3.1: Forward Auction Bidding", href: import.meta.env.VITE_APP_UC31FWDBIDDING_URL || "/uc3.1-forward" },
  { name: "UC3.2: Dutch Auction Bidding", href: import.meta.env.VITE_APP_UC32DCHBIDDING_URL || "/uc3.2-dutch" },
  { name: "UC4: Auction Ended", href: import.meta.env.VITE_APP_UC4END_URL || "/uc4-ended" },
  { name: "UC5: Payment", href: import.meta.env.VITE_APP_UC5PAY_URL || "/uc5-payment" },
  { name: "UC6: Receipt Page", href: import.meta.env.VITE_APP_UC6RECEIPT_URL || "/uc6-receipt" },
  { name: "UC7: Sell Item", href: import.meta.env.VITE_APP_UPLOAD_URL || "/uc7-sell" },
  { name: "UC7: Update Dutch Auction", href: import.meta.env.VITE_APP_UPDATE_URL || "/uc7-update" },
];

const Sidebar: React.FC = memo(() => {
  const liStyle = "flex w-full text-left";

  return (
    <aside
      className="fixed top-0 left-0 w-[200px] h-screen bg-gray-100 overflow-y-auto pl-4 pr-4 pt-4"
      aria-label="Sidebar"
    >
      <p className="mb-2">Menu</p>
      <ul>
        {sidebarItems.map((link) => (
          <li
            key={link.name}
            className="mb-2 hover:text-white hover:font-medium hover:border"
          >
            <RouterNavLink
              to={link.href ?? "#"}
              className={({ isActive }) =>
                isActive ? `${liStyle} text-white` : `${liStyle}`
              }
            >
              {link.name}
            </RouterNavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
});

export default Sidebar;
