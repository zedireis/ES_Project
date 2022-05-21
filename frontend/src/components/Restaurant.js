import React, { Component, useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
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

export const ListFood = () =>{

    const [food_list,setFoodList] = useState();
    const [isLoading,setLoadStatus] = useState(true);

    const [selected_foods,setSelected] = useState([]);

    const [current_cost, setCost] = useState(0);

    const location = useLocation();

    const nav=useNavigate();

    function previousSelection(){
        if(location.state != null){
            var foods = location.state[0];
            var order_list = location.state[1];
            console.log("PREVIOUS?");

            setFoodList(foods);
            setSelected(order_list);

            let newCost = 0;
            for(let i=0; i<order_list.length; i++){
                newCost += order_list[i].cost*100;
            }
            setCost(newCost);
            setLoadStatus(false);
        }else{
            console.log("Load Foods");
            axios({
                method: "GET",
                url:"/kitchen/food_list",
              }).then((response)=>{
                //console.log("HERE -> " + response.data.food_list);
                setFoodList(response.data.food_list);
                setLoadStatus(false);
              }).catch((error) => {
                if (error.response) {
                  console.log(error.response);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                  }
              })
        }
    }

    useEffect(() => {
        // Get List of food
        //axios
        previousSelection();
    }, [setFoodList]);

    function addItem(name, cost){
        setSelected([...selected_foods,{"name":name, "cost":cost}]);
        setCost(current_cost + cost*100);
        
    }

    function deleteItem(index){
        //const newList = selected_foods.filter((item) => item.id !== index);
        setCost(current_cost - selected_foods[index].cost*100);
        setSelected([
            ...selected_foods.slice(0, index),
            ...selected_foods.slice(index + 1)
          ]);
    }

    function goBack(){
        nav("/restaurant");
    }

    if (isLoading){
        return(<div>
                <a>LOADING</a>
            </div>)
    }else{
        return(
            <div>
            <button onClick={goBack}>BACK</button> <h3>SELECT FOOD</h3>
            <div style={{width:"80%"}}>
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
                                onClick={
                                    () => {
                                        addItem(d.name, d.cost);
                                    }
                                }
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
            <div style={{height:"100%",width:"20%", position:"fixed", zIndex:"1", top:"0", right:"0", paddingTop:"10px", backgroundColor:"grey"}} >
                <h4 style={{textAlign:"center"}}>SELECTED ITEMS</h4>
                <ul  style={{display:"flex", flexDirection:"column", height:"70%", listStyleType:"none", padding:"5px", overflow:"auto"}}>
                    {selected_foods.map(function(i,idx){
                        return(
                            <li key={idx} style={{padding: '10px', backgroundColor: 'lightgray', borderRadius: '10px', marginBottom: '5px'}}>
                                <a>{i.name}   </a>
                                <button 
                                onClick={() => {deleteItem(idx);}}
                                style={{float:"right"}}
                                >X</button>
                            </li>
                        )
                    })}
                </ul>
                <h5 style={{textAlign:"center"}}>Total: {(current_cost/100).toFixed(2)} €</h5>
                <Link to="/restaurant/identity" state={[food_list,selected_foods]}>
                Next Step
                </Link>
            </div>
            </div>
        )
    }
    
}

export const ConfirmIdentity = () =>{

    const location = useLocation();
    const food_list = location.state[0];
    const selected_foods = location.state[1];

    const nav=useNavigate();

    function goBack(){
        nav(-1);
    }

    return(
        <div>
            <Link to="/restaurant/choose" state={[food_list,selected_foods]}>
                Go Back
            </Link>
            <a>{selected_foods[0].name}</a>
        </div>
    )
}

export const RestaurantPages = () => {

    const nav=useNavigate();

    const onClick = ()=>{
        nav("choose")
    }

    return (
    <div>
        <h1>HOMEPAGE</h1>
        <button onClick={onClick}>BEGIN</button>
    </div>
    );
}
  
export default RestaurantPages;