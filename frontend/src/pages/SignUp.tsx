import axios from "axios";
import {useState} from "react"

const SignUp = () => {
    const defaultSignUpForm = {
        fname: "",
        lname: "",
        uname: "",
        pw: "",
        streetno: "",
        street: "",
        city: "",
        country: "",
        postal: ""
    };
    const [signupForm, setSignUpForm]
        = useState(defaultSignUpForm);
    const [failedSignUp, setFailedSignUp] = useState(false);
    const signUp = (event: React.FormEvent) =>{
        console.log(`user ${signupForm.uname} pw ${signupForm.pw}`)
        axios({
            baseURL: "http://localhost:5000",
            url: "signup",
            method: "post",
            data: {
                fname: signupForm.fname,
                lname: signupForm.lname,
                username: signupForm.uname,
                password: signupForm.pw,
                streetno: signupForm.streetno,
                street: signupForm.street,
                city: signupForm.city,
                country: signupForm.country,
                postal: signupForm.postal
            }
        }).then((result) => {
            console.log(result.data);
            window.location.href = import.meta.env.VITE_APP_LOGIN_URL
            setFailedSignUp(false);
        }).catch((error) => {
            setFailedSignUp(true);
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });

        setSignUpForm(defaultSignUpForm);

        event.preventDefault();
    }
    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the signupForm state whenever a field changes
        const {value, name} = event.target
        setSignUpForm(prevNote => ({
                ...prevNote, [name]: value
            })
        )
    }
    const fieldStyle = "border";

    return(
        <div className={"flex flex-col items-center gap-4"}>
        <h1>Welcome to the Scripters Auction Platform</h1>
            <form>
                <div className={"grid grid-cols-1 white max-w-md items-start"}>
                    <label htmlFor={"fname"}>First Name</label>
                    <input type={"text"} name={"fname"} value={signupForm.fname} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"lname"}>Last Name</label>
                    <input type={"text"} name={"lname"} value={signupForm.lname} onChange={updateForm} className={fieldStyle}/>

                    <label htmlFor={"uname"}>Username</label>
                    <input type={"text"} name={"uname"} value={signupForm.uname} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"pw"}>Password</label>
                    <input type={"text"} name={"pw"} value={signupForm.pw} onChange={updateForm} className={fieldStyle}/>

                    <label htmlFor={"streetno"}>Street Number</label>
                    <input type={"text"} name={"streetno"} value={signupForm.streetno} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"street"}>Street Address</label>
                    <input type={"text"} name={"street"} value={signupForm.street} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"city"}>City</label>
                    <input type={"text"} name={"city"} value={signupForm.city} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"country"}>Country</label>
                    <input type={"text"} name={"country"} value={signupForm.country} onChange={updateForm} className={fieldStyle}/>
                    <label htmlFor={"postal"}>Postal Code</label>
                    <input type={"text"} name={"postal"} value={signupForm.postal} onChange={updateForm} className={fieldStyle}/>

                    <input type={"submit"} name={"submit"} onClick={signUp} className={"mt-8"}/>
                </div>
            </form>
        {failedSignUp?
            <p className={"text-red-400"}>Please check credentials and try again.</p>
            : <></>
        }
        <div className="card">
            <button onClick={() => window.location.href = import.meta.env.VITE_APP_LOGIN_URL }>
                Go To Login
            </button>
        </div>
        </div>
    )
}
export default SignUp;