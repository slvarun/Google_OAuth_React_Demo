import React, { useState, useEffect, useContext, useReducer, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link , useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './login';
import Callback from './callback';

const CounterContext = React.createContext();

axios.defaults.withCredentials = true;

const AuthContext = React.createContext();
const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user }
      } = await axios.get(`http://localhost:5000/auth/logged_in`);
      setLoggedIn(logged_in);
      console.log(loggedIn);
      user && setUser(user);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>{children}</AuthContext.Provider>;
};

const counterReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return { count: action.count, mycount: action.mycount };
    case 'INCREMENT':
      return { count: state.count + 1, mycount: state.mycount };
    case 'DECREMENT':
      return { count: state.count - 1, mycount: state.mycount };
    case 'MY_SET':
      return { count: action.count, mycount: action.mycount };
    case 'MY_INCREMENT':
      return { mycount: state.mycount + 1, count: state.count };
    case 'MY_DECREMENT':
      return { mycount: state.mycount - 1, count: state.count };
    default:
      return state;
  }
};

const Home = () => {
  const { state } = useContext(CounterContext);
  const { user, checkLoginState } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await axios.post(`http://localhost:5000/auth/logout`);
      // Check login state again
      checkLoginState();
    } catch (err) {
      console.error(err);
    }
  };

  const { loggedIn } = useContext(AuthContext);
  
  if (loggedIn === false) return <Login />;
  if (loggedIn === true) {
    return (
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/counter">Counter</Link>
            </li>
            <li>
              <Link to="/mycounter">MY_Counter</Link>
            </li>
          </ul>
        </nav>
        <div className="card" style={{ margin: 'auto' }}>
          <img src={user.picture} alt={`${user.given_name}'s profile`} className="profile-pic" />
          <p>Welcome</p>
          <h1 className="name">{user.name}</h1>
          <p className="email">{user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <h1>Counter Value: {state.count}</h1>
        <Link to="/counter">Counter</Link>
        <h1>My_Counter Value: {state.mycount}</h1>
        <Link to="/mycounter">MY_Counter</Link>
      </div>
    );
  }
};

const MyCounter = () => {
  const { state, dispatch } = useContext(CounterContext);
  const navigate = useNavigate();

  const fetchCounter = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mycounter');
      dispatch({ type: 'MY_SET', mycount: response.data.mycount, count: response.data.count });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  const incrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/myincrement');
      dispatch({ type: 'MY_INCREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const decrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/mydecrement');
      dispatch({ type: 'MY_DECREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);
  return (
    <div>
      <h2>MyCounter</h2>
      <p>MyCount: {state.mycount}</p>
      <button onClick={incrementCounter}>my_Increment</button>
      <button onClick={decrementCounter}>my_Decrement</button>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};

const Counter = () => {
  const { state, dispatch } = useContext(CounterContext);
  const navigate = useNavigate();

  const fetchCounter = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/counter');
      dispatch({ type: 'SET', mycount: response.data.mycount, count: response.data.count });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  const incrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/increment');
      dispatch({ type: 'INCREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const decrementCounter = useCallback(async () => {
    try {
      await axios.post('http://localhost:5000/api/counter/decrement');
      dispatch({ type: 'DECREMENT' });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {state.count}</p>
      <button onClick={incrementCounter}>Increment</button>
      <button onClick={decrementCounter}>Decrement</button>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};

const App = () => {
  const [state, dispatch] = useReducer(counterReducer, { count: 0, mycount: 0 });
  
  return (
    <AuthContextProvider>
      <CounterContext.Provider value={{ state, dispatch }}>
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/counter" element={<Counter />} />
              <Route path="/mycounter" element={<MyCounter />} />
              <Route path="/auth/callback" element = {<Callback AuthContext={AuthContext}/>}/>
            </Routes>
          </div>
        </Router>
      </CounterContext.Provider>
    </AuthContextProvider>
  );
};

export default App;
