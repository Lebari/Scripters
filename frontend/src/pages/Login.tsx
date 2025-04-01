import axios from "axios";
import React, {useRef, useState} from "react"
import {useTokenContext} from "../components/TokenContext.tsx";
import {useNavigate} from "react-router-dom";
import Button from "../components/Button.tsx";

const Login = () => {
    const {setToken} = useTokenContext();

    const [loginForm, setLoginForm] = useState({uname: "", pw: ""});
    const [failedLogin, setFailedLogin] = useState(false);
    const navigate = useNavigate();
    const isNavigating = useRef(false);

    const goToCatalogPage = () => {
        if (isNavigating.current) return;
        isNavigating.current = true;
        navigate(`/catalog`);
    };

    const loginU = (event: React.FormEvent) =>{
        console.log(`user ${loginForm.uname} pw ${loginForm.pw}`)
        axios({
            baseURL: "http://localhost:5001",
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

            goToCatalogPage();
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

                    <Button type={"submit"} name={"submit"} onClick={loginU}>Log In</Button>
                </div>
            </form>
        {failedLogin?
            <p className={"text-red-400"}>Please check credentials and try again.</p>
            : <></>
        }
        <div>
            <Button onClick={() => window.location.href = import.meta.env.VITE_APP_SIGNUP_URL }>
                Go To Signup
            </Button>
            <Button onClick={logoutU }>Logout</Button>
        </div>
        </div>
    )
}
export default Login;