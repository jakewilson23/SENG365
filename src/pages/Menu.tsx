import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";
import * as loginTracker from "./components/LoggedInTracker";

const Main = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    React.useEffect(() => {

    }, [id])

    if (errorFlag) {
        return (
            <div>
                <h1>User</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <div className="loginTracker">
                    {loginTracker.default()}
                </div>
                <div className="title">
                    <h1>Film Festival Site</h1>
                    <h2>SENG365 Assignment 2</h2>
                </div>
                <div id="filmSearchLink">
                    <Link to={"/films"} className={"big-link"}>Search Festival Films</Link>
                </div>
            </div>
        )
    }
}

export default Main;