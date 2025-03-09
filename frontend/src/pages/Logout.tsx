import axios from "axios";
import {useState} from "react"

const Logout = () => {
    const [loginForm, setLogoutForm] = useState({uname: "", pw: ""});
    const [failedLogout, setFailedLogout] = useState(false);
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
        }).then((result) => {
            console.log(result.data);
            window.location.href = import.meta.env.VITE_APP_CATALOG_URL
            setFailedLogout(false);
        }).catch((error) => {
            setFailedLogout(true);
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });

        setLogoutForm(({
            uname: "",
            pw: ""
        }));

        event.preventDefault();
    }
    const logoutU = () =>{
        axios({
            baseURL: "http://localhost:5000",
            url: "logout",
            method: "post"
        }).then((result) => {
            console.log(result);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }
    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the loginForm state whenever a field changes
        const {value, name} = event.target
        setLogoutForm(prevNote => ({
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
        {failedLogout?
            <p className={"text-red-400"}>Please check credentials and try again.</p>
            : <></>
        }
        <div className="card">
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
export default Logout;