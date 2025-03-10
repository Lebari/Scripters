import './App.css'
import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";
import Sidebar from "./components/Sidebar.tsx";
import SignUp from "./pages/SignUp.tsx";
import Logout from "./pages/Logout.tsx";

import {useTokenContext} from "./components/TokenContext.tsx";

function App() {
  //session tracking
  const {user} = useTokenContext();

  return (
      <div className="min-h-screen flex gap-8 pt-8 pb-10">
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
              </Routes>
          </div>
      </div>
  )
}

export default App
