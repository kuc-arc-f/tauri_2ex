//import { Routes, Route, Link } from 'react-router-dom';
import React from "react";
import {Link } from 'react-router-dom';
//
function Page() {
    return (
    <div>
        <Link to="/" className="ms-2">Home</Link>
        <Link to="/task_project" className="ms-2">[ task ]</Link>
        <Link to="/about" >&nbsp; [ about ]</Link>
        <hr />
    </div>
    );
}
export default Page;
/*
<span><a href="/table2"> [ table2 ]</a></span>
*/