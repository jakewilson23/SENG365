import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";

const Register = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [responseCode, setResponseCode] = React.useState(0)
    const [userEmail, setUserEmail] = React.useState("")
    const [userFirstName, setUserFirstName] = React.useState("")
    const [userLastName, setUserLastName] = React.useState("")
    const [userPassword, setUserPassword] = React.useState("")
    const [passwordHiddenFlag, setPasswordHiddenFlag] = React.useState(true)
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [newUserImage, setNewUserImage] = React.useState<Blob>();
    const [newUserImageType, setNewUserImageType] = React.useState("");
    const [newUserId, setNewUserId] = React.useState(-1)

    React.useEffect(() => {
        setErrorFlag(false)
    }, [userEmail, userFirstName, userLastName, userPassword])

    React.useEffect(() => {
        checkLoggedIn()
    }, [])

    const registerUserAccount = () => {
        console.log("register happens")
        let reqParams:any = {}
        reqParams["email"] = userEmail
        reqParams["firstName"] = userFirstName
        reqParams["lastName"] = userLastName
        reqParams["password"] = userPassword

        axios.post('http://localhost:4941/api/v1/users/register', reqParams )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
                setNewUserId(response.data.userId)
                loginToRegisteredAccount();    //Automatically log the user in
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
            })
    }
    const loginToRegisteredAccount = () => {
        console.log("login happens")
        let reqParams:any = {}
        reqParams["email"] = userEmail
        reqParams["password"] = userPassword

        axios.post('http://localhost:4941/api/v1/users/login', reqParams )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
                sessionStorage.setItem("Auth_Token", response.data.token)
                sessionStorage.setItem("Auth_User_Id", response.data.userId)
                setLoggedInFlag(true)
                if (newUserImage) {
                    addUserImage()
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
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

    const addUserImage = () => {
        console.log("new User image happens")
        let userId = sessionStorage.getItem("Auth_User_Id")
        let tempUserId = -1
        if (userId !== null) {
            tempUserId = parseInt(userId, 10)
        }
        let reqBody:any = {}
        if (newUserImage) {
            reqBody = newUserImage
        }

        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth
        if (newUserImageType !== "") {
            reqHeaders["Content-Type"] = newUserImageType
        }

        axios.put('http://localhost:4941/api/v1/users/' + tempUserId + '/image', reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
            })
    }

    const responseCodeMessage = () => {
        if (errorFlag) {
            if (responseCode === 400) {
                return (
                    <div>
                        <p>Invalid Details Entered</p>
                    </div>
                )
            } else if (responseCode === 403){
                return (
                    <div>
                        <p>The email address you entered is already in use</p>
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
            if (responseCode === 201) {
                return (
                    <div>
                        <p>Your Account has been successfully Registered</p>
                    </div>
                )
            } else {
                if (responseCode === 200) {
                    return (
                        <div>
                            <p>Your Account has been successfully Registered and you have been Logged in</p>
                        </div>
                    )
                }
            }
        }
    }

    const inputPasswordField = () => {
        if (!(loggedInFlag)) {
            if (passwordHiddenFlag) {
                return (
                    <div id="registerPassword">
                        <p>Enter your Password</p>
                        <input type="password" onChange={(e) => changePassword(e.target.value)}/>
                        <button onClick={() => togglePasswordHidden()}>Show Password</button>
                        <p>Your Password must be at least 6 characters long</p>
                    </div>
                )
            } else {
                return (
                    <div id="registerPassword">
                        <p>Enter your Password</p>
                        <input type="input" onChange={(e) => changePassword(e.target.value)}/>
                        <button onClick={() => togglePasswordHidden()}>Hide Password</button>
                        <p>Your Password must be at least 6 characters long</p>
                    </div>
                )
            }
        }
    }

    const inputEmailField = () => {
        if (!(loggedInFlag)) {
            return (
                <div id="registerEmail">
                    <h3>Enter your Email Address</h3>
                    <input type="text" onChange={(e) => changeUserEmail(e.target.value)}/>
                    <p>You must supply a valid Email Address (must contain an @ and a top level domain).</p>
                    <p>The Email Address cannot be in use by another user.</p>
                </div>
            )
        }
    }

    const inputNameField = () => {
        if (!(loggedInFlag)) {
            return (
                <div id="registerName">
                    <h3>Enter Your First Name</h3>
                    <input type="text" onChange={(e) => changeFirstName(e.target.value)}/>
                    <h3>Enter Your Last Name</h3>
                    <input type="text" onChange={(e) => changeLastName(e.target.value)}/>
                </div>
            )
        }
    }

    const registerButtonField = () => {
        if (!(loggedInFlag)) {
            return (
                <div id="registerSubmit">
                    <button onClick={() => registerUserAccount()} className="menuLink">Register</button>
                </div>
            )
        }
    }

    const changeUserEmail = (newUserEmail: string) => {
        setUserEmail(newUserEmail)
    }

    const changeFirstName = (newUserFirstName: string) => {
        setUserFirstName(newUserFirstName)
    }

    const changeLastName = (newUserLastName: string) => {
        setUserLastName(newUserLastName)
    }

    const changePassword = (newUserPassword: string) => {
        setUserPassword(newUserPassword)
    }

    const togglePasswordHidden = () => {
        if (passwordHiddenFlag) {
            setPasswordHiddenFlag(false)
        } else {
            setPasswordHiddenFlag(true)
        }
    }

    const inputNewFilmImage = () => {
        return (
            <div id="inputNewImage">
                <h3>Input your User Image</h3>
                <input type="file" onChange={handleUserImageChange} accept="image/png, image/jpeg, image/gif"/>
            </div>
        )
    }

    const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        setNewUserImageType(e.target.files[0]["type"])
        e.target.files[0].arrayBuffer().then((arrayBuffer) => {
            const blob = new Blob([new Uint8Array(arrayBuffer)]);
            setNewUserImage(blob);
        });

    };

    return (
        <div>
            <div className="loginTracker">
                {loginTracker.default()}
            </div>
            <div className="manageTitle">
                <h1>Register a New Account</h1>
            </div>
            <div className="filmSearch">
                {inputEmailField()}
                {inputNameField()}
                {inputPasswordField()}
                {inputNewFilmImage()}
            </div>
            {responseCodeMessage()}
            {registerButtonField()}
            <div id="menuLink">
                <Link to={"/"} className="menuLink">Back to Main Menu</Link>
            </div>
        </div>
    )
}

export default Register;