import {useTokenContext} from "../components/TokenContext.tsx";
import {useEffect} from "react";

const Logout = () => {
    const {removeUser} = useTokenContext();

    const logoutU = () =>{
        console.log("Sign Out Successful");
        removeUser();
    }
    useEffect(() => {
        logoutU();
    }, [])

    return(
        <div className={"flex flex-col items-center gap-4"}>
        <h1>Sign out successful</h1>
        </div>
    )
}
export default Logout;