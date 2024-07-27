import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import loginImg from '../../public/madrasa.jpeg'; // Make sure to replace this with the actual path to your image                                                                                            


import { useNavigate } from 'react-router-dom';

import { db } from "../../lib/firebase";
import { collection, getDoc, doc} from "firebase/firestore";

import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

async function fetchDataFromFirestore(reg) {
    const snapDoc = await getDoc(doc(db, "class-1", reg));
    return snapDoc
}


export default function LoginPage(){

  const [showStudent, setShowStudent] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const [date, setDate] = useState(new Date());
  const [regNumber, setRegNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  const navigate = useNavigate();


  const handleToggle = () => {
    setShowStudent(!showStudent);
    setShowAdmin(!showAdmin);
  };

  const handleStudentLogin = async (e) => {
      
    e.preventDefault();

    const toastId = toast('checking...', {
      position: 'bottom-center',
      type: 'info',
      hideProgressBar: true,
      closeButton: false,
      theme: 'dark',                                                              
      style: {
        borderRadius: '10px',
      },
    });

    try {
      const snapDoc = await fetchDataFromFirestore(regNumber);
      const userData = snapDoc.data();
      const formattedDate = format(date, 'dd/MM/yyy');
      if(!snapDoc.exists()){
       // document.getElementById('regNumber').focus();
        toast.update(toastId, {
          render: "Invalid username",
          type: "error",
          autoClose: 1000,
          onClose: () => {
            document.getElementById('regNumber').focus();
          }
        });
      }else if(formattedDate !== userData.dob){
        toast.update(toastId, {
          render: "Incorrect date of birth",
          type: "error",
          autoClose: 1000,
          onClose: () => {
            document.getElementById('dob').focus();
          }
        });
      } else {
        toast.update(toastId, {
          type: 'success',
          render: 'Successfull', 
          autoClose: 1000,
          onClose: () => {
              navigate('/home', {
                state: {
                  userData
                }
              });
          }
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "An error occurred.  Please try again.",
        type: "error",
        autoClose: 2000
      });
    }  
  }

  const handleAdminLogin = (e) => {
      e.preventDefault();

      const toastId = toast('checking...', {
        position: 'bottom-center',
        type: 'info',
        hideProgressBar: true,
        closeButton: false,
        theme: 'dark',                                                              
        style: {
          borderRadius: '10px',
        },
      });

      const uname = userName.toLowerCase();
      const ps = password.toLowerCase();
      const cls = uname.length === 6 ? uname.slice(-1) : uname.slice(-2);
      console.log(uname);
      const credentials = ps === uname;
      if(!credentials || +cls > 12 || +cls < 1){
          toast.update(toastId, {
          render: "Incorrect username or password",
          type: "error",
          autoClose: 1000,
          onClose: () => {
            document.getElementById('username').focus();
          }
        });
      } else{
        toast.update(toastId, {
          type: 'success',
          render: 'Login Successfull', 
          autoClose: 1000,
          onClose: () => {
              navigate('/admin', {
                state: {
                  cls
                }
              });
          }
        });
      }
  }    
  return (
      <div className="flex flex-col w-screen h-screen mx-auto shadow-md bg-gray-900 p-2">
          <h3 className='text-2xl text-white font-bold text-center'>SUBULULHUDA HIGHER SECONDARY MADRASA</h3>
          <img className='mt-6' src={loginImg} alt="welcome" style={{height: '400px', padding: '1px', border: 'rounded', borderRadius: '10px'}} />
        {showStudent && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div style={{marginTop: '90px'}} className='mt-10 absolute top-4 right-4  bg-gray-900 flex items-center text-white cursor-pointer rounded-lg p-2 px-3' onClick={handleToggle}>
            <span className='mr-3 dark:text-white font-bold text-center'>Student</span>
            <FontAwesomeIcon icon={faUser} className='mr-2' />
          </div>
        )}
        {showAdmin && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div style={{marginTop: '90px'}} className='mt-10 absolute top-4 right-4  bg-gray-900 flex items-center text-white cursor-pointer rounded-lg p-2 px-3' onClick={handleToggle}>
            <span className='mr-3 dark:text-white font-bold text-center'>Admin</span>
            <FontAwesomeIcon icon={faUser} className='mr-2' />
          </div>
        )}
          <div className='p-3'>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button className='w-full my-5 py-4 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            onClick={handleOpenModal}
            >{showStudent && 'Check result' || showAdmin && 'Login'}</button>
          </div>
        
        {isModalOpen &&
          <div className='fixed inset-0 px-4 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center'>
              <div className="flex items-center justify-center h-full w-full">
                  {showStudent && (
                      <form className='max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-10 shadow-xl shadow-gray-500/50'
                          onSubmit={handleStudentLogin}>
                          <h2 className='text-2xl text-white font-bold text-center'>Student Login</h2>
                          <div className='mt-4 flex flex-col text-gray-400 py-2'>
                            <label>Register number</label>
                            <input
                              className='rounded-lg bg-gray-200 mt-2 p-3 text-gray-900 focus:border-blue-500 focus:outline-none'
                              type='text'
                              id='regNumber'
                              required
                              value={regNumber}
                              onChange={(e) => {
                                  setRegNumber(e.target.value)
                              }}
                              placeholder='Enter your register number'
                            />
                          </div>
                          <div className='mt-2 flex flex-col text-gray-400 py-3'>
                            <DatePicker
                              className='rounded-lg bg-gray-200 mt-2 p-2 text-gray-900 focus:border-blue-500 focus:outline-none'
                              value={date}
                              id='dob'
                              format='dd/MM/yyyy'
                              onChange={setDate}
                            />
                          </div>
                          <div className='p-3'>
                            <button className='w-full my-5 py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
                            type='submit'
                            >Submit</button>
                          </div>
                      </form>
                  )}
                  {showAdmin && (
                      <form className='max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-10 shadow-xl shadow-gray-500/50'
                          onSubmit={handleAdminLogin}>
                          <h2 className='text-2xl text-white font-bold text-center'>Admin Login</h2>
                          <div className='mt-4 flex flex-col text-gray-400 py-3'>
                              <label>Username</label>
                              <input className='rounded-lg bg-gray-200 mt-2 p-3 focus:border-blue-500 text-gray-900 focus:outline-none' type="text"
                                  required
                                  id='username'
                                  value={userName}
                                  onChange={(e) => {
                                      setUserName(e.target.value);
                                  }}
                                  placeholder='Enter your username'
                              />
                          </div>
                          <div className='mt-2 flex flex-col text-gray-400 py-3'>
                              <label>Password</label>
                              <input className='p-2 rounded-lg bg-gray-200 mt-2 p-3 focus:border-blue-500 text-gray-900 focus:outline-none' type="password" 
                                  required
                                  id='password'
                                  value={password}
                                  onChange={(e) => {
                                      setPassword(e.target.value);
                                  }}
                                  placeholder='Enter your password'
                              />
                          </div>
                          <div className='p-3'>
                              <button className='w-full my-5 py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
                              type='submit'
                              >Login</button>
                          </div>
                      </form>
                  )}
                </div>
              </div>
          }
        <ToastContainer style={{ padding: '16px',}} />
      </div>
  );    
};
