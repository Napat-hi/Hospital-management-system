
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/Adminpage';
import Doctor from './pages/Doctorpage';
import Staff from './pages/Staffpage';
import Contact from './pages/Contect';
// import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



export default function App() {
  // const [response,setResponse]=useState({});
  const [setResponse]=useState({});

  return(

    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/Adminpage" element={<About />} />
          <Route path="/Doctorpage" element={<Doctor />} />
          <Route path="/Staffpage" element={<Staff />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/home" element={<Home setResponse={setResponse}/>} />

        </Routes>
      </BrowserRouter >


      


    </div >
  )
}
