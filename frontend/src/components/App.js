import React, { Component, useState, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { render } from "react-dom";
import { KitchenPages, Kitchen_login, Kitchen_homepage, AddFood } from "./Kitchen";
import { RestaurantPages, Restaurant_login, Restaurant_homepage, ListFood, ConfirmOrder, VerifyOrder } from "./Restaurant";
import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLogged : false,
      isStaff : 1
    };
  }

  askLogin = () => {
    axios({
      method: "GET",
      url:"/api/login",
    }).then((response)=>{
      const data = response.data;
      /* this.setState({isLogged : true}) */
      this.setState({isLogged : data.login});
      this.setState({isStaff : data.role});
      console.log("IS LOGGED -> " + this.state.isLogged);
    }).catch((error) => {
      if (error.response) {
        console.log(error.response);
        console.log(error.response.status);
        console.log(error.response.headers);
        }
    })
  }
  
  componentDidMount() {
    {this.askLogin()}
  }

  onLogged = ({loginStatus, staffStatus}) => {
    console.log("GOING TO CHANGE STATE "+ loginStatus + staffStatus);
    this.setState({isLogged : loginStatus});
    this.setState({isStaff : staffStatus});
  }

  render() {
    return (
      <div>
      <header>
      <div className="thirteen">
        <h1>Restaurant</h1>
      </div>
      <br/>
      </header>
      <Router>
        <Routes>
          <Route exact path="/restaurant"  element={<RestaurantPages/>}></Route>
          <Route path="/restaurant/choose" element={<ListFood/>} />
          <Route path="/restaurant/confirm" element={<ConfirmOrder/>} />
          <Route path="/restaurant/verify" element={<VerifyOrder/>} />
          <Route exact path="/kitchen"  element={this.state.isLogged && this.state.isStaff > 1 ?<Navigate to="/kitchen/homepage" />:<Kitchen_login onLogin={this.onLogged}/>}></Route>
          <Route path="/kitchen/homepage" element={this.state.isLogged && this.state.isStaff > 1 ?<Kitchen_homepage onLogout={this.onLogged}/>:<Navigate to="/kitchen"/>} />
          <Route path="/kitchen/create_food" element={this.state.isLogged && this.state.isStaff > 1 ?<AddFood onLogout={this.onLogged}/>:<Navigate to="/kitchen"/>} />
        </Routes>
      </Router>
      </div>
    );
  }
}

export default App;

const container = document.getElementById("app");
render(<App />, container);