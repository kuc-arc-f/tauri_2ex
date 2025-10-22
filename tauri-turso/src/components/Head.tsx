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
        <Link to="/chat" className="ms-2">[ chat ]</Link>
        <hr />
        <span className="ms-2">MCP</span>
        <Link to="/diary" className="ms-2">[ diary ]</Link>
        <Link to="/item_price" className="ms-2">[ itemPrice ]</Link>
        <hr />
    </div>
    );
}
export default Page;
/*
<Link to="/task_project" className="ms-2">[ task ]</Link>
*/