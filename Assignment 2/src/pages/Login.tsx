import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";

const Login = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [responseCode, setResponseCode] = React.useState(0)
    const [userEmail, setUserEmail] = React.useState("")
    const [userPassword, setUserPassword] = React.useState("")
    const [passwordHiddenFlag, setPasswordHiddenFlag] = React.useState(true)
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)

    React.useEffect(() => {
        setErrorFlag(false)
    }, [userEmail, userPassword])

    React.useEffect(() => {
        checkLoggedIn()
    }, [])

    const loginUserAccount = () => {
        let reqLoginParams:any = {}
        reqLoginParams["email"] = userEmail
        reqLoginParams["password"] = userPassword

        axios.post('http://localhost:4941/api/v1/users/login', reqLoginParams)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
                sessionStorage.setItem("Auth_Token", response.data.token)
                sessionStorage.setItem("Auth_User_Id", response.data.userId)
                setLoggedInFlag(true)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
            })
    }

    const checkLoggedIn = () => {
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null || userAuth === null) {
            setLoggedInFlag(false)
        } else {
            //getLoggedUserDetails()
            setLoggedInFlag(true)
        }
    }

    const inputEmailField = () => {
        if (!(loggedInFlag)) {
            return (
                <div id="loginEmail">
                    <h3>Enter Your Email Address</h3>
                    <input type="text" onChange={(e) => changeEmail(e.target.value)}/>
                </div>
            )
        }
    }

    const changeEmail = (newUserEmail: string) => {
        setUserEmail(newUserEmail)
    }

    const inputPasswordField = () => {
        if (!(loggedInFlag)) {
            if (passwordHiddenFlag) {
                return (
                    <div id="registerPassword">
                        <h3>Enter your Password</h3>
                        <input type="password" onChange={(e) => changePassword(e.target.value)}/>
                        <button onClick={() => togglePasswordHidden()}>Show Password</button>
                    </div>
                )
            } else {
                return (
                    <div id="registerPassword">
                        <h3>Enter your Password</h3>
                        <input type="input" onChange={(e) => changePassword(e.target.value)}/>
                        <button onClick={() => togglePasswordHidden()}>Hide Password</button>
                    </div>
                )
            }
        }
    }

    const togglePasswordHidden = () => {
        if (passwordHiddenFlag) {
            setPasswordHiddenFlag(false)
        } else {
            setPasswordHiddenFlag(true)
        }
    }

    const changePassword = (newUserPassword: string) => {
        setUserPassword(newUserPassword)
    }

    const responseCodeMessage = () => {
        if (errorFlag) {
            if (responseCode === 400) {
                return (
                    <div>
                        <p>Invalid Details Entered</p>
                    </div>
                )
            } else if (responseCode === 401){
                return (
                    <div>
                        <p>Incorrect Email or Password</p>
                    </div>
                )
            } else {
                return (
                    <div>
                        <p>There is an error with the server</p>
                    </div>
                )
            }
        } else {
            if (responseCode === 200) {
                return (
                    <div>
                        <p>You have been Logged in</p>
                    </div>
                )

            }
        }
    }

    const loginButtonField = () => {
        if (!(loggedInFlag)) {
            return (
                <div id="loginSubmit">
                    <button onClick={() => loginUserAccount()} className="menuLink">Login</button>
                </div>
            )
        }
    }

    return (
        <div>
            <div className="manageTitle">
                <h1>Log In To Your Account</h1>
            </div>
            <div className="filmSearch">
                {inputEmailField()}
                {inputPasswordField()}
                <p></p>
            </div>
            {responseCodeMessage()}
            {loginButtonField()}
            <div id="menuLink">
                <Link to={"/"} className="menuLink">Back to Main Menu</Link>
            </div>
        </div>
    )
}

export default Login;