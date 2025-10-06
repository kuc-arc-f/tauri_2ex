//import { Routes, Route, Link } from 'react-router-dom';
import React from "react";
import {Link } from 'react-router-dom';
//
function Page() {
    return (
    <div>
        <Link to="/" className="ms-2">Home</Link>
        <Link to="/about" >&nbsp; [ about ]</Link>
        <Link to="/todo">&nbsp; [ todo ]</Link>
        <Link to="/sort">&nbsp; [ sort ]</Link>
        <Link to="/table">&nbsp; [ table ]</Link>
        <Link to="/table2">&nbsp; [ table2 ]</Link>

        <hr />
    </div>
    );
}
export default Page;
/*
<span><a href="/table2"> [ table2 ]</a></span>
*/