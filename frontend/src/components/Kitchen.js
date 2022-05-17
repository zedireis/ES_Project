import React, { Component, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, Link } from 'react-router-dom';
import ReactDOM from "react-dom";
import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

export const Kitchen_homepage = ({onLogout}) => {

    const onClick = ()=>{
        axios({
            method: "POST",
            url:"/api/logout",
            responseType: 'json'
        }).then((response)=>{
            const data = response.data;
            console.log(response.data);
            onLogout({loginStatus : false, staffStatus : 1});
            nav("/kitchen");
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
        <Link to="/kitchen/create_food">
            Create Food
        </Link>
        <ListFood/>
      </div>
    )
  }

export const  Kitchen_login = ({onLogin}) => {
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
            role : 2
            },
            responseType: 'json'
        }).then((response)=>{
            const data = response.data;
            onLogin({loginStatus : true, staffStatus : 2});
            nav("/kitchen/homepage");
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
            <p>WELCOME TO KITCHEN HOMEPAGE!</p>
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

export const ListFood = () =>{

    const [food_list,setFoodList] = useState();
    const [isLoading,setLoadStatus] = useState(true);

    useEffect(() => {
        // Get List of food
        //axios
        console.log("USE EFFECT");
        axios({
            method: "GET",
            url:"/kitchen/food_list",
          }).then((response)=>{
            console.log("HERE -> " + response.data.food_list);
            setFoodList(response.data.food_list);
            setLoadStatus(false);
          }).catch((error) => {
            if (error.response) {
              console.log(error.response);
              console.log(error.response.status);
              console.log(error.response.headers);
              }
          })
    }, [setFoodList]);

    if (isLoading){
        return(<div>
                <a>LOADING</a>
            </div>)
    }else{
        return(
            <div>
                <a>FOOD LIST</a>
                <ul style={{display:"flex",flexWrap:"wrap",listStyleType:"none"}}>
                {food_list.map(function(d, idx){
                    return (
                            <li key={idx} 
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor="gray"
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor="lightgray";
                                }}
                                style={{width:"250px", height:"300px",padding:"20px",backgroundColor:"lightgray",borderRadius:"20px", marginRight:"10px", cursor:"pointer" }}>
                                
                                <div style={{display:"block", height:"70%", width:"90%"}}>
                                    <img style={{maxWidth:"100%",maxHeight:"100%",height:"auto"}} src={"/media/"+d.photo}/>
                                </div>
                                <h3>{d.name}</h3>
                                <p style={{textAlign:"right"}}>{d.cost} €</p>
                                
                            </li>
                        )
                })}
                </ul>
            </div>
        )
    }
    
}

export const AddFood = ({onLogout}) =>{
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [foodInfo, setFoodInfo] = React.useState({name:'',cost:0.01});

    const {name, cost} = foodInfo;

    const onChange = e=>setFoodInfo({...foodInfo,[e.target.name]:e.target.value});

    const nav=useNavigate()

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData();
        formData.append("name", foodInfo.name);
        formData.append("cost", foodInfo.cost);
        formData.append("photo", selectedFile);
        axios({
                method: "post",
                url: "/kitchen/create_food",
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
        }).then((response) => {
            console.log("DID THIS ->" + response.data.details);
            nav("/kitchen/homepage");
        }).catch((error) => {
            console.log(error)
        });
    }

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0])
    }

    return(
        <form onSubmit={handleSubmit}>
            <div>
            <input type="text" 
            name="name" 
            placeholder="Food Name" 
            value={name} 
            onChange={e=>onChange(e)} required />
            <div>
                <input type="number" 
                step=".01"
                name="cost" 
                placeholder="Cost €" 
                value={cost} 
                onChange={e=>onChange(e)} required />
                <b>€</b>
            </div>
            </div>
            <input type="file" onChange={handleFileSelect}/>
            <br/>
            <input type="submit" value="Confirmar" />
        </form>
    )
}

function KitchenPages() {

    return (
    <div>
        <h1>HOMEPAGE</h1>
        
    </div>
    );
}
  
export default KitchenPages;