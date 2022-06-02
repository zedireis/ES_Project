import React, { Component, useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import ReactDOM, { render } from "react-dom";
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
        if(location.state != null && location.state.list !== undefined && location.state.selected !== undefined && location.state.list !== null && location.state.selected !== null){
            var foods = location.state.list;
            var order_list = location.state.selected;
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
            <div className="navigation">
                <button onClick={goBack}  className="button-74">BACK</button> <a>SELECT FOOD</a>
            </div>
            <div style={{width:"80%"}}>
                <ul className="fancyItem" style={{display:"flex",flexWrap:"wrap",listStyleType:"none"}}>
                {food_list.map(function(d, idx){
                    return (
                            <li key={idx} 
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor="#a3c4ce"
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor="#bdced3";
                                }}
                                onClick={
                                    () => {
                                        addItem(d.name, d.cost);
                                    }
                                }
                                style={{width:"250px", height:"300px",padding:"20px",backgroundColor:"#bdced3",borderRadius:"20px", marginRight:"10px", cursor:"pointer" }}>
                                
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
            <div style={{height:"100%",width:"20%", position:"fixed", zIndex:"1", top:"0", right:"0", paddingTop:"10px", backgroundColor:"#8daab3"}} >
                <h2 className="fancy" style={{textAlign:"center", fontSize:"200%"}}>SELECTED ITEMS</h2>
                <ul className="fancyList" style={{display:"flex", flexDirection:"column", height:"70%", listStyleType:"none", padding:"5px", overflow:"auto"}}>
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
                <div style={{textAlign:"center"}}>
                    <Link className="button-52" to="/restaurant/confirm" state={{list : food_list, selected : selected_foods}}>
                    Next Step
                    </Link>
                </div>
            </div>
            </div>
        )
    }
    
}

export const ConfirmOrder = () =>{

    const location = useLocation();

    const food_list = location.state ? location.state.list !== undefined ? location.state.list : null : null;
    const selected_foods = location.state ? location.state.selected !== undefined ? location.state.selected : null : null;

    const [success, setSuccess] = React.useState("not ordered");

    const [selectedFile, setSelectedFile] = React.useState(null);

    const [input, setInput] = React.useState(''); //valor inicial '', para não dar erro ao entrar na página
    const [msg, setMsg] = useState('');

    const nav = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("photo", selectedFile);
        formData.append("items", JSON.stringify(selected_foods));
        formData.append("locationTag", input);
        
        setSuccess("processing");

        axios({
            method: "put",
            url: "/restaurant/place_order",
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
            responseType: 'json'
        }).then((response) => {
            console.log("IM BACK");
            console.log("DID THIS ->" + response.data.details);
            setSuccess("success");
            setMsg(response.data.details)
            //nav("/restaurant/confirm", { state : { success : true }});
        }).catch((error) => {
            console.log("ERRO");
            console.log(error);
        });
    }

    useEffect(() => {
        // Get List of food
        //axios
        verify();
    }, [location.state, success]);

    function renderForm(status){
        switch(status){
            case "not ordered":
                return (
                <div>
                <div className="navigation">
                    <div>
                    <Link to="/restaurant/choose" state={{list : food_list, selected : selected_foods}} className="button-74">
                            BACK
                    </Link>
                    </div>
                    <a>Confirm Order</a>
                </div>

                <form className="cover" onSubmit={handleSubmit}>
                    <input className="file" type="file" onChange={handleFileSelect} accept=".jpg, .jpeg, .png" required/><br></br>
                    <div className="locationTag" >
                        <a>Location Tag: </a>
                        <input type="number" min="1" value={input} onInput={e => setInput(e.target.value)} required/><br></br>
                    </div>
                    <br></br><input className="button-87" type="submit" value="CONFIRM" />
                </form>
                </div>
                )
            case "success":
                return (
                <div>
                <div className="navigation">
                    <div>
                    <Link to="/restaurant/choose" state={{list : food_list, selected : null}} className="button-74">
                        BACK
                    </Link>
                    </div>
                    <a>Confirm Order</a>
                </div>
                <h3>{msg}</h3>
                </div>
                )
            case "processing":
                return (
                <div>
                <div className="navigation">
                    <div>
                    <Link to="/restaurant/choose" state={{list : food_list, selected : null}} className="button-74">
                        BACK
                    </Link>
                    </div>
                    <a>Confirm Order</a>
                </div>
                <h3>Processing your order...</h3>
                </div>
                )
        }
    }

    function verify(){
        if(food_list == null || selected_foods == null){
            nav("/restaurant");
            console.log("Nothing passed")
        }
    }

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0])
    }

    return(
        <div>
            {renderForm(success)}
            <br/>
        </div>
    )
}

export const VerifyOrder = () =>{

    const [input, setInput] = useState('');

    const [msg, setMsg] = useState('');

    const nav = useNavigate();

    function goBack(){
        nav("/restaurant");
    }

    const onClick = ()=>{
        setMsg("Checking");

        if(input == ''){
            setMsg("Please input a ID");
            return
        }

        axios({
            method: "POST",
            url:"/restaurant/place_order",
            data:{
                locationTag : input,
            },
            responseType: 'json'
        }).then((response)=>{
            const data = response.data;
            setMsg(response.data.details);
        }).catch((error) => {
            console.log(error);
        })
        
    }

    return(
        <div>
            <div className="navigation">
                <button onClick={goBack}  className="button-74">BACK</button> <a>CONFIRM RECEPTION</a>
            </div>
            <div className="cover">
                <div>
                    <h3 className="cena" >Insert your location tag ID</h3>
                </div>
                <input className="locationTag" type="number" min="1" value={input} onInput={e => setInput(e.target.value)} required/><br></br>
                <button className="button-87" onClick={onClick}>Confirm Reception</button>
                <a className="locationTag">{msg}</a>
            </div>
            
        </div>
    )
}

export const RestaurantPages = () => {

    const nav=useNavigate();

    const onClick = ()=>{
        nav("choose")
    }

    const onClick2 = ()=>{
        nav("verify")
    }

    return (
    <div>
    <h2 className="main fancyLarge">What do you want to do?</h2>
    <div className="main">
        <button className="button-56" onClick={onClick}>ORDER FOOD</button>
        <button className="button-56" onClick={onClick2}>CHECK TAG</button>
    </div>
    </div>
    );
}
  
export default RestaurantPages;