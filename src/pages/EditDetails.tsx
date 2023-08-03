import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";
import DefaultImage from "../no-image-icon.png";
const EditDetails = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [responseCode, setResponseCode] = React.useState(0)
    const [responseMessage, setResponseMessage] = React.useState("")
    const [addNewEmail, setAddNewEmail] = React.useState("")
    const [addNewFirstName, setAddNewFirstName] = React.useState("")
    const [addNewLastName, setAddNewLastName] = React.useState("")
    const [addNewPassword, setAddNewPassword] = React.useState("")
    const [addOldPassword, setAddOldPassword] = React.useState("")
    const [loggedInFlag, setLoggedInFlag] = React.useState(false)
    const [newPasswordHiddenFlag, setNewPasswordHiddenFlag] = React.useState(true)
    const [oldPasswordHiddenFlag, setOldPasswordHiddenFlag] = React.useState(true)
    const [newUserImage, setNewUserImage] = React.useState<Blob>();
    const [newUserImageType, setNewUserImageType] = React.useState("");

    React.useEffect(() => {
        setErrorFlag(false)
    }, [addNewEmail, addNewFirstName, addNewLastName, addNewPassword, addOldPassword, newUserImage])

    React.useEffect(() => {
        checkLoggedIn()
    }, [id])

    const editProfile = () => {

        let reqBody:any = {}
        if (addNewEmail !== "") {
            reqBody["email"] = addNewEmail
        }
        if (addNewFirstName !== "") {
            reqBody["firstName"] = addNewFirstName
        }
        if (addNewLastName !== "") {
            reqBody["lastName"] = addNewLastName
        }
        if (addNewPassword !== "") {
            reqBody["password"] = addNewPassword
        }
        if (addOldPassword !== "") {
            reqBody["currentPassword"] = addOldPassword
        }

        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth

        axios.patch('http://localhost:4941/api/v1/users/' + id, reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
                setResponseMessage(error.response.statusText)
            })
    }

    const editProfileImage = () => {
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
        console.log(newUserImageType)

        axios.put('http://localhost:4941/api/v1/users/' + id + '/image', reqBody, {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
                setResponseMessage(error.response.statusText)
            })
    }

    const deleteProfileImage = () => {
        let reqHeaders:any = {}
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userAuth === null) {
            userAuth = "-1"
        }
        reqHeaders["X-Authorization"] = userAuth

        axios.delete('http://localhost:4941/api/v1/users/' + id + '/image', {headers: reqHeaders})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setResponseCode(response.status)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setResponseCode(error.response.status)
                setResponseMessage(error.response.statusText)
            })
    }

    const checkLoggedIn = () => {
        let userId = sessionStorage.getItem("Auth_User_Id")
        let userAuth = sessionStorage.getItem("Auth_Token")
        if (userId === null || userAuth === null) {
            setLoggedInFlag(false)
        } else {
            setLoggedInFlag(true)
        }
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
                        <p>{responseMessage}</p>
                    </div>
                )
            } else if (responseCode === 403){
                return (
                    <div>
                        <p>{responseMessage}</p>
                    </div>
                )
            } else if (responseCode === 404){
                return (
                    <div>
                        <p>User does not exist in Database</p>
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
                        <p>Your Profile has been Successfully Edited</p>
                    </div>
                )
            } else if (responseCode === 201) {
                return (
                    <div>
                        <p>Your New User Image has been created</p>
                    </div>
                )
            }
        }
    }

    const inputEmailField = () => {
        if (loggedInFlag) {
            return (
                <div id="editProfileEmail">
                    <h3>Enter your New Email Address</h3>
                    <input type="text" onChange={(e) => changeNewEmail(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewEmail = (newEmail: string) => {
        setAddNewEmail(newEmail)
    }

    const inputFirstNameField = () => {
        if (loggedInFlag) {
            return (
                <div id="editProfileFirstName">
                    <h3>Enter your New First Name</h3>
                    <input type="text" onChange={(e) => changeNewFirstName(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewFirstName = (newFirstName: string) => {
        setAddNewFirstName(newFirstName)
    }

    const inputLastNameField = () => {
        if (loggedInFlag) {
            return (
                <div id="editProfileLastName">
                    <h3>Enter your New Last Name</h3>
                    <input type="text" onChange={(e) => changeNewLastName(e.target.value)}/>
                </div>
            )
        }
    }

    const changeNewLastName = (newLastName: string) => {
        setAddNewLastName(newLastName)
    }

    const inputNewPasswordField = () => {
        if (loggedInFlag) {
            if (newPasswordHiddenFlag) {
                return (
                    <div id="editPassword">
                        <h3>Enter your New Password</h3>
                        <input type="password" onChange={(e) => changeNewPassword(e.target.value)}/>
                        <button onClick={() => toggleNewPasswordHidden()}>Show Password</button>
                        <p>Your New Password must be at least 6 characters long</p>
                    </div>
                )
            } else {
                return (
                    <div id="editPassword">
                        <h3>Enter your New Password</h3>
                        <input type="input" onChange={(e) => changeNewPassword(e.target.value)}/>
                        <button onClick={() => toggleNewPasswordHidden()}>Hide Password</button>
                        <p>Your New Password must be at least 6 characters long</p>
                    </div>
                )
            }
        }
    }

    const toggleNewPasswordHidden = () => {
        if (newPasswordHiddenFlag) {
            setNewPasswordHiddenFlag(false)
        } else {
            setNewPasswordHiddenFlag(true)
        }
    }

    const changeNewPassword = (newNewPassword: string) => {
        setAddNewPassword(newNewPassword)
    }

    const inputOldPasswordField = () => {
        if (loggedInFlag) {
            if (oldPasswordHiddenFlag) {
                return (
                    <div id="editPassword">
                        <h3>Enter your Current Password</h3>
                        <input type="password" onChange={(e) => changeOldPassword(e.target.value)}/>
                        <button onClick={() => toggleOldPasswordHidden()}>Show Password</button>
                    </div>
                )
            } else {
                return (
                    <div id="editPassword">
                        <h3>Enter your Current Password</h3>
                        <input type="input" onChange={(e) => changeOldPassword(e.target.value)}/>
                        <button onClick={() => toggleOldPasswordHidden()}>Hide Password</button>
                    </div>
                )
            }
        }
    }

    const toggleOldPasswordHidden = () => {
        if (oldPasswordHiddenFlag) {
            setOldPasswordHiddenFlag(false)
        } else {
            setOldPasswordHiddenFlag(true)
        }
    }

    const changeOldPassword = (newOldPassword: string) => {
        setAddOldPassword(newOldPassword)
    }

    const inputNewUserImage = () => {
        if (loggedInFlag) {
            return (
                <div id="inputNewImage">
                    <h3>Input your New User Image</h3>
                    <input type="file" onChange={handleUserImageChange} accept="image/png, image/jpeg, image/gif"/>
                </div>
            )
        }
    }

    const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files)
        if (!e.target.files) {
            return;
        }
        setNewUserImageType(e.target.files[0]["type"])
        e.target.files[0].arrayBuffer().then((arrayBuffer) => {
            const blob = new Blob([new Uint8Array(arrayBuffer)]);
            console.log("blob", blob);
            setNewUserImage(blob);
        });

    };

    const editProfileImageButtonField = () => {
        if (loggedInFlag) {
            return (
                <div id="editProfileSubmit">
                    <button onClick={() => editProfileImage()} className="menuLink">Edit Profile Image</button>
                </div>
            )
        }
    }

    const deleteProfileImageButtonField = () => {
        if (loggedInFlag) {
            return (
                <div id="deleteProfileSubmit">
                    <button onClick={() => deleteProfileImage()} className="menuLink">Delete Current Profile Image</button>
                </div>
            )
        }
    }

    const editProfileButtonField = () => {
        if (loggedInFlag) {
            return (
                <div id="editProfileSubmit">
                    <button onClick={() => editProfile()} className="menuLink">Submit Profile Edit</button>
                </div>
            )
        }
    }

    return (
        <div>
            <div className="loginTracker">
                {loginTracker.default()}
            </div>
            <div className="manageTitle">
                <h1>Edit Your Profile</h1>
            </div>
            <div className="filmSearch">
                {inputEmailField()}
                {inputFirstNameField()}
                {inputLastNameField()}
                {inputNewPasswordField()}
                {inputOldPasswordField()}
                {inputNewUserImage()}
                {editProfileImageButtonField()}
                {deleteProfileImageButtonField()}
            </div>
            {responseCodeMessage()}
            {editProfileButtonField()}
            <div id="menuLink">
                <Link to={"/"} className="menuLink">Back to Main Menu</Link>
            </div>
        </div>
    )
}

export default EditDetails;