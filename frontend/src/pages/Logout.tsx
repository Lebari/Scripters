import axios from "axios";
import {useTokenContext} from "../components/TokenContext.tsx";
import {useEffect} from "react";

const Logout = () => {
    const {removeUser} = useTokenContext();

    const logoutU = () =>{
        axios({
            baseURL: "http://localhost:5000",
            url: "logout",
            method: "post"
        }).then((result) => {
            console.log(result);
            removeUser();
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
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