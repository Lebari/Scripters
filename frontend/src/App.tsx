import './App.css'
import { Routes, Route } from 'react-router'
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";

function App() {

  return (
    <Routes>
        <Route index element={ <Home/> }/>
        <Route path={"catalog"} element={ <Catalog/> }/>
        {/*<Route path={"signup"} element={ <SignUp/> }/>*/}
        <Route path={"login"} element={ <Login/> }/>
        {/*<Route path={"logout"} element={ <Logout/> }/>*/}
    </Routes>
  )
}

export default App
