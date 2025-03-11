import axios from "axios";
import React, {useState} from "react"
import {useTokenContext} from "../components/TokenContext.tsx";

const Login = () => {
    const {setToken} = useTokenContext();

    const [loginForm, setLoginForm] = useState({uname: "", pw: ""});
    const [failedLogin, setFailedLogin] = useState(false);
    const loginU = (event: React.FormEvent) =>{
        console.log(`user ${loginForm.uname} pw ${loginForm.pw}`)
        axios({
            baseURL: "http://localhost:5000",
            url: "login",
            method: "post",
            data: {
                username: loginForm.uname,
                password: loginForm.pw
            }
        }).then(async (result) => {
            console.log(result.data);
            setToken(result.data.token);
            setFailedLogin(false);
            window.location.href = import.meta.env.VITE_APP_CATALOG_URL; // Redirect to catalog
        }).catch(async (error) => {
            setFailedLogin(true);
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });

        setLoginForm(({
            uname: "",
            pw: ""
        }));

        event.preventDefault();
    }

    const logoutU = () =>{
        window.location.href = import.meta.env.VITE_APP_LOGOUT_URL
    }
    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the loginForm state whenever a field changes
        const {value, name} = event.target
        setLoginForm(prevNote => ({
                ...prevNote, [name]: value
            })
        )
    }

    return(
        <div className={"flex flex-col items-center gap-4"}>
        <h1>Welcome to the Scripters Auction Platform</h1>
            <form>
                <div className={"grid grid-cols-1 white max-w-md items-start"}>
                    <label htmlFor={"uname"}>Username</label>
                    <input type={"text"} name={"uname"} value={loginForm.uname} onChange={updateForm}/>
                    <label htmlFor={"pw"}>Password</label>
                    <input type={"text"} name={"pw"} value={loginForm.pw} onChange={updateForm}/>

                    <input type={"submit"} name={"submit"} onClick={loginU}/>
                </div>
            </form>
        {failedLogin?
            <p className={"text-red-400"}>Please check credentials and try again.</p>
            : <></>
        }
        <div>
            <button onClick={() => window.location.href = import.meta.env.VITE_APP_SIGNUP_URL }>
                Go To Signup
            </button>
            <button onClick={logoutU }>
                Logout
            </button>
        </div>
        </div>
    )
}
export default Login;