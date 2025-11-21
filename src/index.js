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

reportWebVitals();
