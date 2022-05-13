import React, { Component, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { render } from "react-dom";

const Kitchen_homepage = () => {
  const year = new Date().getFullYear();
  const [formData,setFormData] = useState({
    email:'',
    password:''
  })

  const {email,password} = formData;

  const onChange = e=>setFormData({...formData,[e.target.name]:e.target.value});

  const onClick = ()=>{
      console.log("LOGIN->"+email+password);
  }

  return (
    <div>
      <h2>
        <p>WELCOME TO KITCHEN HOMEPAGE!</p>
        <p>Assim tudo bem</p>
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
      <div>
          <button onClick={onClick}>Login</button>
      </div>
      <footer>Copyright ⓒ {year}</footer>
    </div>
  );
}

const Client_homepage = () => {
  const year = new Date().getFullYear();
  return (
    <div>
      <h2>
        <p>WELCOME TO KITCHEN HOMEPAGE!</p>
      </h2>
      <footer>Copyright ⓒ {year}</footer>
    </div>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
      <h1>HELLO!</h1>
      <Router>
        <Routes>
          <Route exact path="/kitchen"  element={<Kitchen_homepage/>}></Route>
          <Route exact path="/restaurant"  element={<Client_homepage/>}></Route>
        </Routes>
      </Router>
      </div>
    );
  }
}

export default App;

const container = document.getElementById("app");
render(<App />, container);

/* class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading"
    };
  }

  componentDidMount() {
    fetch("kitchen/homepage")
      .then(response => {
        if (response.status > 400) {
          return this.setState(() => {
            return { placeholder: "Something went wrong!" };
          });
        }
        return response.json();
      })
      .then(data => {
        this.setState(() => {
          return {
            data,
            loaded: true
          };
        });
      });
  }

  render() {
    return (
		<h1>
		  "REACT HERE!"
		</h1>
    );
  }
}

export default App;

const container = document.getElementById("app");
render(<App />, container); */