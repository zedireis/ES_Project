import React, { Component, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import ReactDOM from "react-dom";
import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

export const Restaurant_homepage = ({onLogout}) => {

    const onClick = ()=>{
        axios({
            method: "POST",
            url:"/api/logout",
            responseType: 'json'
        }).then((response)=>{
            const data = response.data;
            console.log(response.data);
            onLogout({loginStatus : false, staffStatus : 1});
            nav("/restaurant");
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
            }
        })
    }

    return (
      <div>
        <header>
            <button onClick={onClick}>Logout</button>
        </header>
        <h1>LOGIN SUCCESS!</h1>
      </div>
    )
  }

export const  Restaurant_login = ({onLogin}) => {
    const year = new Date().getFullYear();
    const [formData,setFormData] = useState({
        email:'',
        password:''
    })

    const [err,setError] = useState({
        error:''
    })

    const {email,password} = formData;

    const nav=useNavigate()

    const onChange = e=>setFormData({...formData,[e.target.name]:e.target.value});

    const onClick = ()=>{
        axios({
            method: "POST",
            url:"/api/login",
            data:{
            email : email,
            password : password,
            role : 1
            },
            responseType: 'json'
        }).then((response)=>{
            const data = response.data;
            onLogin({loginStatus : true, staffStatus : 2});
            nav("/restaurant/homepage");
        }).catch((error) => {
            if (error.response) {
            console.log(error.response.status);
            if(error.response.status == 403){
                console.log(error.response.data.detail);
                setError({error : error.response.data.detail+" Check if you have permissions."})
            }
            }
        })
    }

    return (
        <div>
        <h2>
            <p>WELCOME TO RESTAURANT HOMEPAGE!</p>
        </h2>
        <div>
            <input type="text" 
            name="email" 
            placeholder="Email" 
            value={email} 
            onChange={e=>onChange(e)} required />
        </div>
        <div>
            <input type="password" 
            name="password" 
            placeholder="Password" 
            value={password} 
            onChange={e=>onChange(e)} required />
        </div>
        <p>{err.error}</p>
        <div>
            <button onClick={onClick}>Login</button>
        </div>
        <footer>Copyright ⓒ {year}</footer>
        </div>
    );
}

function RestaurantPages() {

    return (
    <div>
        <h1>HOMEPAGE</h1>
    </div>
    );
}
  
export default RestaurantPages;