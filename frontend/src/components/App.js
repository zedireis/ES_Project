import React, { Component, useState, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { render } from "react-dom";
import { KitchenPages, Kitchen_login, Kitchen_homepage } from "./Kitchen";
import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

const Client_homepage = () => {
  const year = new Date().getFullYear();
  return (
    <div>
      <h2>
        <p>WELCOME TO CLIENT HOMEPAGE!</p>
      </h2>
      <footer>Copyright ⓒ {year}</footer>
    </div>
  );
}

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      isLogged : false
    };
  }

  askLogin = () => {
    axios({
      method: "GET",
      url:"/api/login",
    }).then((response)=>{
      const data = response.data;
      /* this.setState({isLogged : true}) */
      this.setState({isLogged : data.login})
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
    console.log("IS LOGGED -> "+this.state.isLogged);
  }

  onLogged = ({loginStatus}) => {
    console.log("GOING TO CHANGE STATE "+ loginStatus);
    this.setState({isLogged : loginStatus});
  }

  render() {
    return (
      <div>
      <h1>HELLO!</h1>
      <Router>
        <Routes>
          <Route exact path="/kitchen"  element={this.state.isLogged?<Navigate to="/kitchen/homepage" />:<Kitchen_login onLogin={this.onLogged}/>}></Route>
          <Route exact path="/restaurant"  element={<Client_homepage />}></Route>
          <Route path="/kitchen/homepage" element={this.state.isLogged?<Kitchen_homepage onLogout={this.onLogged}/>:<Navigate to="/kitchen"/>} />
        </Routes>
      </Router>
      </div>
    );
  }
}

export default App;

const container = document.getElementById("app");
render(<App />, container);