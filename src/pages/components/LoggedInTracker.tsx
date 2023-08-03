import axios from 'axios';
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import DefaultImage from '../../no-image-icon.png';

const LoggedInTracker = () => {

    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [loggedFirstName, setLoggedFirstName] = React.useState("")
    const [loggedLastName, setLoggedLastName] = React.useState("")
    const [loggedEmail, setLoggedEmail] = React.useState("")
    const [userImage, setUserImage] = React.useState(DefaultImage);

    React.useEffect(() => {
        checkLoggedIn()
    }, [])

    const getLoggedUserDetails = () => {
        let reqUserParams:any = {}
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null) {
            userId = "-1"
        }
        if (userAuth === null) {
            userAuth = "-1"
        }
        let userIdInt = parseInt(userId, 10);
        reqUserParams["X-Authorization"] = userAuth
        axios.get('http://localhost:4941/api/v1/users/' + userIdInt, {headers: reqUserParams} )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setLoggedEmail(response.data.email)
                setLoggedFirstName(response.data.firstName)
                setLoggedLastName(response.data.lastName)
                getUserImage()
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
            getLoggedUserDetails()
            setLoggedInFlag(true)
        }
    }

    const getUserImage = () => {
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null) {
            userId = "-1"
        }
        let userIdInt = parseInt(userId, 10);
        axios.get('http://localhost:4941/api/v1/users/' + userIdInt + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                const base64 = btoa(
                    new Uint8Array(response.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                    )
                )
                setUserImage(`data:;base64,${base64}`)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setUserImage(DefaultImage)
            })
    }

    const logoutUserAccount = () => {
        let reqUserParams:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqUserParams["X-Authorization"] = userAuth
        axios.post('http://localhost:4941/api/v1/users/logout',{},{headers: reqUserParams} )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setLoggedEmail("")
                setLoggedFirstName("")
                setLoggedLastName("")
                sessionStorage.removeItem("Auth_Token")
                sessionStorage.removeItem("Auth_User_Id")
                setLoggedInFlag(false)
                setLoggedInFlag(false)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const userAccount = () => {
        if (loggedInFlag) {
            let userId = sessionStorage.getItem("Auth_User_Id")
            if (userId === null) {
                userId = "-1"
            }
            let intUserId = parseInt(userId, 10)
            if (isNaN(intUserId)) {
                intUserId = -1
            }
            return (
                <div>
                    <div className="userImage">
                        <img src={userImage} alt="Users Hero Image"/>
                    </div>
                    <div className="loggedInDetails">
                        <p>You are Logged in as</p>
                        <p>{loggedFirstName} {loggedLastName}</p>
                        <p>{loggedEmail}</p>
                    </div>
                    <div className="loggedInManage">
                        <Link to={"/manage"} className="loggedLink">View Your Films/Reviews</Link>
                    </div>
                    <div className="loggedInEdit">
                        <Link to={"/edit/" + intUserId} className="loggedLink">Edit Profile</Link>
                    </div>
                    <div className="loggedInLogoutButton">
                        <button onClick={() => logoutUserAccount()}>Logout</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="notLoggedIn">
                    <p>You are not Logged in</p>
                    <div>
                        <Link to={"/login"} className="notLoggedLink">Log In</Link>
                    </div>
                    <div>
                        <Link to={"/register"} className="notLoggedLink">Register</Link>
                    </div>
                </div>
            )
        }
    }

    return (
        <div>
            {userAccount()}
        </div>
    )
}

export default LoggedInTracker;