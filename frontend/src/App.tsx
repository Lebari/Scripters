import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";
import Sidebar from "./components/Sidebar.tsx";
import SignUp from "./pages/SignUp.tsx";
import Logout from "./pages/Logout.tsx";
import AuctionSearchDisplay from "./pages/AuctionSearchDisplay.tsx"; // Updated combined component
import ForwardBidding from "./pages/ForwardBidding.tsx";
import DutchBidding from "./pages/DutchBidding.tsx";

import axios from "axios";

import { useEffect } from "react";
import {useTokenContext} from "./components/TokenContext.tsx";

function App() {
    //session tracking
    const {user, setUser} = useTokenContext();

  const getUser = ()=>{
      axios({
          baseURL: "http://localhost:5000",
          url: "user",
          method: "get"
      }).then(async (result) => {
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
    useEffect(() => {getUser();}, []);

  return (
      <div className="min-h-screen flex flex-row gap-8 bg-black">
          {/* Sidebar */}
          <div className="border-r mb-10">
              <Sidebar/>
          </div>

          {/* Main section */}
          <div className="w-full flex flex-col pb-16 px-4 gap-4 min-h-screen flex-grow">
              <p>User: {user.username!==""? <>{user.username}</>: <>Guest</>}</p>
              <Routes>
                  <Route index element={ <Catalog/> }/>
                  <Route path={import.meta.env.VITE_APP_CATALOG_URL} element={ <Catalog/> }/>
                  <Route path={import.meta.env.VITE_APP_SIGNUP_URL} element={ <SignUp/> }/>
                  <Route path={import.meta.env.VITE_APP_LOGIN_URL} element={ <Login/> }/>
                  <Route path={import.meta.env.VITE_APP_LOGOUT_URL} element={ <Logout/> }/>

                  {/* Combined Auction Search & Display Page */}
                  <Route
                      path={import.meta.env.VITE_APP_SEARCH_URL}
                      element={<AuctionSearchDisplay />}
                  />

                  {/* Forward Auction Bidding Page */}
                  <Route path={import.meta.env.VITE_APP_UC31FWDBIDDING_URL} element={<ForwardBidding />} />

                  {/* Dutch Auction Bidding Page */}
                  <Route path={import.meta.env.VITE_APP_UC31FWDBIDDING_URL} element={<DutchBidding />} />
              </Routes>
          </div>
      </div>
  )
}

export default App;
