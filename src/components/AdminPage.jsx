import React, { useState, useEffect, useRef } from 'react';

import { db } from "../../lib/firebase";
import { collection, getDocs, doc, query, where} from "firebase/firestore";
import { useLocation } from 'react-router-dom';

import TableComponent from './TableContent';


import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';    

import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  

import { tableHeaders, classData } from './classDatas';

async function fetchDataFromFirestore(cls) {
    const q = query(collection(db, 'class-1'), where('class', '==', `${cls}`));
    const querySnapshot = await getDocs(q);
    const dataList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return dataList;
}

export default function AdminPage() {

    const location = useLocation();
    const { cls } = location.state || {};  

    const [data, setData] = useState([]);
    // biome-ignore lint/style/noVar: <explanation>
    var  clas = cls;

    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date());

    const classRef = useRef();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    let std = clas;

    std = clas === '4' || clas === '5' ? '3' : std;
    std = clas === '6' || clas === '7' ? '6' : std;
    std = clas === '8' || clas === '9' ? '8' : std;
    std = clas === '10' || clas === '11' || clas === '12' ? '10' : std;

    const columns = tableHeaders[std];
    
    const handleAddData = (e) => {
        e.preventDefault();

        const toastId = toast('uploading...', {
            position: 'bottom-center',
            type: 'info',
            hideProgressBar: true,
            closeButton: false,
            theme: 'dark',                                                              
            style: {
                borderRadius: '10px',
            },
        });
        const v = classRef.current.value;
        clas = v.slice(-1);
        handleOpenModal();                                                                                                                                   
    }      

    const subjects = classData[clas]

    const fetchData = async () => {
        try {
            const userData = await fetchDataFromFirestore(clas);
            setData(userData);
            if(userData.length === 0){
                setError('Student data has not been added');
            }
            else{
                setError('');
            }
        } catch (error) {
          setError('Error fetching data');
        }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        fetchData();
    }, []);

    return(
        <>                                                                                                      
        <div className="flex flex-col w-full h-screen mx-auto shadow-md p-2">
            <div className='text-center mt-4 py-2'>
                <p className="text-white text-lg font-bold">Class : {clas}</p>
                <p className="text-white text-lg font-bold">Total students : {data.length}</p>
            </div>
            <div className="flex flex-col bg-white w-full rounded-lg flex-grow shadow-md mt-3 p-3 px-4 overflow-hidden">
                {error === '' && <TableComponent data={data} columns={columns}/>}
                {error && (<div className='flex items-center justify-center w-full h-full'>
                    <h3 className='text-center text-gray-700 text-lg text-sm font-semibold'>
                      {error}
                    </h3>
                </div>
                )}
            </div>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button className='w-full py-3 my-5 bg-teal-500 shadow-md shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            onClick={handleOpenModal}
            >Add data</button>
            <ToastContainer />
            {isModalOpen &&
                <div className='fixed inset-0 px-4 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center'>
                    <form className='max-w-[500px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8 shadow-xl shadow-gray-500/50 flex flex-col overflow-auto max-h-screen'
                        onSubmit={handleAddData}>
                        <h2 className='text-2xl text-white font-bold text-center'>Add Student Data</h2>
                    <div className='mt-3 overflow-auto p-3 px-4 flex-grow border border-gray-700 rounded-lg' style={{ maxHeight: '60vh' }}>
                        <div className='flex flex-col text-gray-400 py-3'>
                          <input className='rounded-lg bg-gray-200 mt-2 p-3 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type='text'
                            ref={classRef}
                            disabled
                            value={`${`Class - ${cls}`}`}
                            />
                        </div>
                        <div className='mt-2 flex flex-col text-gray-400 py-2'>
                          <label>Student admission number</label>
                          <input
                            className='rounded-lg bg-gray-200 mt-2 p-3 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type="text"
                            id='regNumber'
                            required
                            placeholder='Enter student admission number'
                          />
                        </div>
                        <div className='mt-2 flex flex-col text-gray-400 py-2'>
                          <label>Student name</label>
                          <input
                            className='rounded-lg bg-gray-200 mt-2 p-3 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type="text"
                            id='name'
                            required
                            placeholder='Enter student name'
                          />
                        </div>
                        <div className='mt-2 flex flex-col text-gray-400 py-2'>
                            <label>Date of birth</label>
                            <DatePicker
                              className='rounded-lg bg-gray-200 mt-2 p-2 text-gray-900 focus:border-blue-500 focus:outline-none'
                              value={date}
                              id='dob'
                              format='dd/MM/yyyy'
                              onChange={setDate}
                            />
                        </div>
                        {subjects.map((sub, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <div key={index} className='mt-2 flex flex-col text-gray-400 py-2'>
                                <label>{sub.toUpperCase()}</label>
                                <input
                                  className='rounded-lg bg-gray-200 mt-2 p-3 focus:border-blue-500 text-gray-900 focus:outline-none'
                                  type="number"
                                  id={sub}
                                  required
                                  placeholder={`Enter ${sub} mark`}
                                />
                            </div>
                        ))}
                    </div>
                        {/*error && <p className=" mt-2 font-bold text-l text-red-500 text-center">{error}</p>*/}
                        <div className='p-3'>
                          <button className='w-full my-2 py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
                          type='submit'
                          >Add data</button>
                        </div>
                        <div className='p-3'>
                          <button className='w-full py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
                          type='reset'
                          onClick={handleCloseModal}
                          >Close form</button>
                        </div>
                    </form>
                </div>
            }
        </div>
        </>                             
    )
}