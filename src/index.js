import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Home from './pages/Home';
import Adminpage from './pages/Adminpage';
import Doctorpage from './pages/Doctorpage';
import Staffpage from './pages/Staffpage';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
 
} from "react-router-dom";




const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/Adminpage",
    element: <Adminpage />,
  },
  {
    path: "/Doctorpage",
    element: <Doctorpage />,
  },
  {
    path: "/Staffpage",
    element: <Staffpage />,
  },

]);


<RouterProvider router={router} />


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
