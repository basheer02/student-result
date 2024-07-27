import React from 'react';
import './index.css';

import AdminPage from './components/AdminPage';

import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  const location = useLocation();
  const { userData } = location.state || {};

  console.log(userData);

  toast.success('Login Successfull', {
    autoClose: 2000,
    position: 'bottom-center',
    hideProgressBar: false,
  });

  return (
    <>
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-4xl text-white">Welcome to the Home Page</h1>
      <ToastContainer />
    </div>
    </>
  );
}

export default App;
