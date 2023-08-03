import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Films from "./pages/Films";
import Film from "./pages/Film";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Manage from "./pages/Manage";
import Add from "./pages/Add";
import Edit from "./pages/Edit";
import Review from "./pages/Review";
import EditDetails from "./pages/EditDetails";

function App() {
    return (
        <div className="App">
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<Menu/>}/>
                        <Route path="/films" element={<Films/>}/>
                        <Route path="/films/:id" element={<Film/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/manage" element={<Manage/>}/>
                        <Route path="/manage/add" element={<Add/>}/>
                        <Route path="/manage/edit" element={<Edit/>}/>
                        <Route path="/film/:id/review" element={<Review/>}/>
                        <Route path="/edit/:id" element={<EditDetails/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
            </Router>
        </div>
    );
}


export default App;
