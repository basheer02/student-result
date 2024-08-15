import React, { useState, useRef } from 'react';

import { db } from "../../lib/firebase";
import { getDoc, doc, updateDoc} from "firebase/firestore";


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import { classSubjects, studentCount, updateRank } from './classDatas';

import { fetchDataFromFirestore } from './AdminPage';

export default function DataEditing({clas, dataLength, openModal, closeModal, onClose}) {


    const  studRef = useRef();
    const markRef = useRef();
    const admRef = useRef();
    const formRef = useRef();

    const [updatedMarks, setUpdatedMarks] = useState({});

    const [admissionNumber, setAdmissionNumber] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [editableData, setEditableData] = useState([]);
    
    const subjects = classSubjects[clas];

    const fetchEditableData = async (admNo) => {

      const docRef = doc(db, 'subululhuda', admNo);
      const docExistsOrNot = await getDoc(docRef);
      if(docExistsOrNot.exists()){
        const dataList = docExistsOrNot.data();
        setEditableData(dataList);
        studRef.current.value = dataList.name;
        setUpdatedMarks(prevMarks => ({
            ...prevMarks,
            'adm no': admNo
        }));
      }
    }

    //console.log(editableData);

    const handleEditData = async (e) => {
      e.preventDefault();

      const message = `Data: ${JSON.stringify(updatedMarks)}\nIs this data correct?`;

      // Display the confirmation dialog
      const userConfirmed = window.confirm(message);

      if(userConfirmed) {

        const toastId = toast('student data updating...', {
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
            const totalMark = subjects.reduce((acc, subject) => acc + (+editableData[subject]), 0);
            editableData["total mark"] = totalMark
            
            const docRef = doc(db, 'subululhuda', admissionNumber);
            await updateDoc(docRef, editableData);
            toast.update(toastId, {
                render: 'Student data successfully updated',
                type: 'success',
                autoClose: 1000,
                onClose: () => {
                  openModal();
                  formRef.current.reset();
                  admRef.current.focus();
                  setSelectedSubject('');
                }
            });

            try {
              if(dataLength === studentCount[clas]){
                const userData = await fetchDataFromFirestore(clas);
                const res = await updateRank(userData, clas);
              }
            } catch (error) {
              console.log('Error in updating rank : ', error);
            }

        } catch (error) {
            toast.update(toastId, {
                render: `Some error occured, try again. ${error}`,
                type: 'error',
                autoClose: 1000,
                onClose: () => {
                    openModal();
                    admRef.current.focus();
                  }
              });
        }
      } else {
        admRef.current.focus();
      }

    }

    const handleEditing = (sub, mark) => {
        setUpdatedMarks(prevMarks => ({
            ...prevMarks,
            [sub]: mark
        }));

        editableData[sub] = mark;
    }

    return(
        <>
        <form className='max-w-[500px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8 shadow-xl shadow-gray-500/50 flex flex-col overflow-auto max-h-screen'
          ref={formRef}
          onSubmit={handleEditData}>
          <h2 className='text-2xl text-white font-bold text-center'>Edit Student Data</h2>
          <div className='flex flex-col text-gray-400 py-3'>
            <label>Student admission number</label>
            <input
              className='rounded-lg bg-gray-200 mt-2 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
              type="number"                                                        
              ref={admRef}
              onChange={(e) => {
                if(e.target.value !== ''){
                  setAdmissionNumber(e.target.value);
                  fetchEditableData(e.target.value);}
              }}
              required
              placeholder='Enter student admission number'
            />
          </div> 
          <div className='flex flex-col text-gray-400 py-2'>
            <label>Student name</label>
            <input className='rounded-lg bg-gray-200 mt-1 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
              ref={studRef}
              type='text'
              disabled
            />
          </div>
          <div className='flex flex-col text-gray-400 py-2'>
            <select className='rounded-lg bg-gray-200 mt-1 p-3 focus:border-blue-500 text-gray-900 focus:outline-none'
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setTimeout(() => {
                  markRef.current.value = '';
                }, 1000);
              }}
              > 
              <option value="">Select subject to update mark</option>
              {subjects.map((sub, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <option key={index} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          {selectedSubject &&
            <div className='flex flex-col text-gray-400 py-2'>
              <label>{selectedSubject}</label>
              <input className='rounded-lg bg-gray-200 mt-1 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
                type='text'
                ref={markRef}
                placeholder={`${editableData[selectedSubject]}`}
                onChange={(e) => handleEditing(selectedSubject, e.target.value)}
              />
            </div>
          }
          <div className='p-3'>
            <button className='w-full mt-2 py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            type='submit'
            >Update data</button>
          </div>
          <div className='p-3'>
            <button className='w-full py-2 bg-teal-500 shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            type='reset'
            onClick={ () => {
              closeModal();
              onClose();
             // onDone;
            }}
            >Close form</button>
          </div>
        </form>
        <ToastContainer style={{ padding: '16px',}}/>
        </>
    )
}