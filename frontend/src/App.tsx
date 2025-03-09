import './App.css'
import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";
import Sidebar from "./components/Sidebar.tsx";
import SignUp from "./pages/SignUp.tsx";
import Logout from "./pages/Logout.tsx";
import {useState} from "react";
import {User} from "./models.ts";
import axios from "axios";

function App() {
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
  const [user, setUser]
      = useState<User>(defaultUser);

  const getUser = ()=>{
      console.log(`user retrieved? ${user.username}`)
      axios({
          baseURL: "http://localhost:5000",
          url: "user",
          method: "get"
      }).then((result) => {
          console.log(result.data);
          setUser(result.data);
      }).catch((error) => {
          if (error.response) {
              console.log(error.response);
              console.log(error.response.status);
              console.log(error.response.headers);
          }
      });
  }
  getUser();

  return (
      <div className="min-h-screen flex gap-4 pt-8 pb-10">
          {/* Sidebar */}
          <div className="border-r mb-10">
              <Sidebar/>
          </div>
          {/* Main section */}
          <div className="w-full flex flex-col pb-16 pr-4 gap-4 min-h-screen flex-grow">
              <p>User: {user.username!==""? <>${user.username}</>: <></>}</p>
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
