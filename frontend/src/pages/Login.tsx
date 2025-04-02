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
        navigate(`${import.meta.env.VITE_APP_CATALOG_URL}`);
    };

    const [failureMsg, setFailureMsg] = useState("Please check credentials and try again.");

    const validateForm = (): boolean =>{
        if (!loginForm.uname) { setFailureMsg("Name must be a non-empty string"); return false;}
        if (!loginForm.pw) { setFailureMsg("Password must be a non-empty string"); return false;}
        return true;
    }

    const loginU = (event: React.FormEvent) =>{
        console.log(`user ${loginForm.uname} pw ${loginForm.pw}`)
        const valid = validateForm();
        if (valid) {
            axios({
                baseURL: import.meta.env.VITE_API_URL,
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
        }

        event.preventDefault();
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
                    <input type={"text"} name={"uname"} value={loginForm.uname} onChange={updateForm} maxLength={50}/>
                    <label htmlFor={"pw"}>Password</label>
                    <input type={"password"} name={"pw"} value={loginForm.pw} onChange={updateForm} maxLength={50}/>

                    <Button type={"submit"} name={"submit"} onClick={loginU}>Log In</Button>
                </div>
            </form>
        {failedLogin?
            <p className={"text-red-400"}>{failureMsg}</p>
            : <></>
        }
        <div>
            <Button onClick={() => window.location.href = import.meta.env.VITE_APP_SIGNUP_URL }>
                Go To Signup
            </Button>
        </div>
        </div>
    )
}
export default Login;