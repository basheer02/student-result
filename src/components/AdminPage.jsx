import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { db } from "../../lib/firebase";
import { collection, getDocs, getDoc, setDoc, doc, query, where} from "firebase/firestore";
import { useLocation } from 'react-router-dom';

import TableComponent from './TableContent';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { createColumnHelper } from '@tanstack/react-table';
import { classSubjects, studentCount, updateRank } from './classDatas';

import DataEditing from './DataEditing';

export async function fetchDataFromFirestore(cls) {
    const q = query(collection(db, 'subululhuda'), where('class', '==', `${cls}`));
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
    const isInitialRender = useRef(true);

    const [data, setData] = useState([]);

    // biome-ignore lint/style/noVar: <explanation>
    var  clas = cls;

    const [error, setError] = useState('');
    
    const [name, setName] = useState('');
    const [admissionNumber, setAdmissionNumber] = useState('');
    const [attendance, setAttendance] = useState('');

    
    const fileRef = useRef();
    const classRef = useRef();
    const formRef = useRef();
    const admRef = useRef();
    const columnHelper = createColumnHelper();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const handleEditOpenModal = () => setIsEditModalOpen(true);
    const handleEditCloseModal = () => setIsEditModalOpen(false);

    const subjects = classSubjects[clas];

    const staticColumns = [
      columnHelper.accessor('id', {
        header: 'Adm No.',
      }),
      columnHelper.accessor('name', {
        header: 'Name',
      }),
      columnHelper.accessor('attendance', {
        header: 'Attendance'
      })
    ];

    const dynamicColumns = subjects.map(subject =>
      columnHelper.accessor(subject, {
        header: subject,
      })
    );

    const totalMarkColumn = [ 
      columnHelper.accessor('total mark', {
        header: 'Total Mark',
      }), 
      columnHelper.accessor('rank', {
        header: 'Rank',
      }),
    ]

    const columns = [...staticColumns, ...dynamicColumns, ...totalMarkColumn];

    // biome-ignore lint/style/useConst: <explanation>
    let  studentData = {
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      'class': clas,
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      'name': name,
    }


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

    const handleUploadData = async (e) => {
        e.preventDefault();
        let flag = false;

        const toastId = toast('student data uploading...', {
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

          const docRef = doc(db, 'subululhuda', admissionNumber);
          const docExistsOrNot = await getDoc(docRef);
          if(docExistsOrNot.exists()){
            toast.update(toastId, {
              render: 'Student data already exists',
              type: 'error',
              autoClose: 2000,
              onClose: () => {
                formRef.current.reset();
                admRef.current.focus();
              }
            })
          } else {
            const totalMark = subjects.reduce((acc, subject) => acc + (+studentData[subject]), 0);
            studentData["total mark"] = totalMark;
            studentData.attendance = attendance;
            await setDoc(docRef, studentData);
            studentData.id = admissionNumber;
            setData(prevData => [...prevData, studentData]);

            toast.update(toastId, {
              render: 'Student data successfully uploaded',
              type: 'success',
              autoClose: 1000,
              onClose: () => {
                if(!flag){
                  formRef.current.reset();
                  admRef.current.focus();
                }
                if(error){
                  setError('');
                }
              }
            })

            if(data.length+1 === studentCount[clas]){
              const allData = [...data,studentData]
              const res = await updateRank(allData,clas);
              toast(`${res[1]}`, {
                position: 'bottom-center',
                type: `${res[0]}`,
                hideProgressBar: true,
                closeButton: false,
                theme: 'dark',                                                              
                style: {
                    borderRadius: '10px',
                },
              });
              flag = true
            }
          }
        } catch (error) {
          console.log(error)
          toast.update(toastId, {
            render: 'Error in uploading student data, try again',
            type: 'error',
            autoClose: 2000,
          })
        }
        const v = classRef.current.value;
        clas = v.slice(-1); 
        if(flag) {
          handleCloseModal();
        }                                                                                                                                
    }      


    const handleFileUpload = async (event) => {
      event.preventDefault();

      const file = event.target.files[0];

      if (!file) {
        return;
      }

      // Check the file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast('Select excel file', {
          position: 'bottom-center',
          type: 'error',
          hideProgressBar: true,
          closeButton: false,
          theme: 'dark',                                                              
          style: {
              borderRadius: '10px',
          },
          autoClose:2000,
        });
        return;
      }

      toast.loading('student data uploading...', {
        position: 'bottom-center',
        hideProgressBar: true,
        closeButton: false,
        theme: 'dark',                                                              
        style: {
            borderRadius: '10px',
        },
      });

      const reader = new FileReader();
  
      reader.onload = async (e) => {
        const fileData = new Uint8Array(e.target.result);
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const header = XLSX.utils.sheet_to_json(worksheet, {header: 1})[0];

        const newHeaders = ['id', 'name', 'attendance', ...subjects]

        for (let i = 0; i < header.length; i++) {
          const address = XLSX.utils.encode_cell({ c: i, r: 0 }); // c: column, r: row
          worksheet[address].v = newHeaders[i];
        }

        //const head = XLSX.utils.sheet_to_json(worksheet, {header: 1})[0];
        const json = XLSX.utils.sheet_to_json(worksheet, {header: newHeaders});   
        const jsonData = json.slice(1)
        

        try {
          const totalRows = jsonData.length;                                                              
          let existingRows = 0;

          for(const row of jsonData) {
            const totalMarks = subjects.reduce((acc, subject) => acc + (+row[subject] || 0), 0);
            row["total mark"] = totalMarks;
            row.class = clas;
            const docId = String(row.id);
            const { id, ...rowDataWithoutId } = row;

            console.log(rowDataWithoutId);


            const docRef = doc(db, 'subululhuda', docId);
            const docExists = await getDoc(docRef);
            if(docExists.exists()){
              existingRows++;
            }else {
              await setDoc(docRef, rowDataWithoutId);
              setData(prevData => [...prevData, row]);
            }

          };

          toast.dismiss();
          
          if (totalRows !== existingRows) {

            if(error){
              setError('');
            }
            toast.success('student data succefully uploaded', {
              position: 'bottom-center',
              hideProgressBar: true,
              closeButton: false,
              theme: 'dark',                                                              
              style: {
                  borderRadius: '10px',
              },
            });

            if(data.length+totalRows === studentCount[clas]){
              const allData = [...data, ...jsonData]
              const res = await updateRank(allData,clas);
              toast(`${res[1]}`, {
                position: 'bottom-center',
                type: `${res[0]}`,
                hideProgressBar: true,
                closeButton: false,
                theme: 'dark',                                                              
                style: {
                    borderRadius: '10px',
                },
              })
            }
            
          } else {
            toast.success('All data already exists', {
              position: 'bottom-center',
              hideProgressBar: true,
              closeButton: false,
              theme: 'dark',  
              autoClose: 2000,                                                            
              style: {
                  borderRadius: '10px',
              },
            });
          }
          setTimeout(() => {
            fileRef.current.value = '';
          }, 1000);
        } catch (error) {
          console.log(error);
          toast.error('Error in uploading student data, try again', {
            position: 'bottom-center',
            hideProgressBar: true,
            closeButton: false,
            theme: 'dark', 
            autoClose: 2000,                                                             
            style: {
                borderRadius: '10px',
            },
          });
        }
      };
  
      reader.readAsArrayBuffer(file);
    };


    const downloadPDF = () => {

      if(error){
        toast('Add some student data', {
          type: 'error',
          position: 'bottom-center',
          hideProgressBar: true,
          closeButton: false,
          theme: 'dark',                                                              
          style: {
              borderRadius: '10px',
          },
          autoClose: 2000
          })
      } else {
        const doc = new jsPDF();
        let cols = ['id', 'name', 'attendance']
        // biome-ignore lint/complexity/noForEach: <explanation>
        Object.values(subjects).forEach(value => cols.push(value));
        cols.push('total mark', 'rank')
        console.log(cols);
        const rows = Object.values(data).map(obj => cols.map(key => obj[key]))
        cols[0] = 'Admission No.'
        cols[2] = 'hajar'
        cols = cols.map(str => str.toUpperCase());
        
        doc.autoTable({
          head: [cols],
          body: rows
        });
        doc.save(`Class_${clas}_data.pdf`);
        toast('student data download has started',{
          type: 'success',
          position: 'bottom-center',
          hideProgressBar: true,
          closeButton: false,
          theme: 'dark',                                                              
          style: {
              borderRadius: '10px',
          },
          autoClose: 2000
        })
      }
    }

    const onEditingComplete = async() => {
      await fetchData();
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if(isInitialRender.current){
        fetchData();
        isInitialRender.current = false;
      }
    }, [location.pathname]);

    return(
        <>                                                                                                      
        <div className="flex flex-col w-full h-screen mx-auto shadow-md p-2">
            <div className='flex flex-col bg-white w-full rounded-lg mt-4 py-2'>
                <div className='absolute right-4 rounded-lg border border-gray-900 p-1 px-3'>
                  <FontAwesomeIcon icon={faDownload} className='text-gray-900 cursor-pointer' size='sm'
                  onClick={downloadPDF} />
                </div>
                <p className="text-gray-900 text-lg ml-5 font-bold">Class : {clas}</p>
                <p className="text-gray-900 text-lg ml-5 font-bold">Total students : {data.length}</p>
            </div>
            <div className="flex flex-col bg-white w-full rounded-lg flex-grow shadow-md mt-3 p-3 px-4 overflow-auto">
                {error === '' && <TableComponent data={data} columns={columns}/>}
                {error && (<div className='flex items-center justify-center w-full h-full'>
                    <h3 className='text-center text-gray-700 text-lg text-sm font-semibold'>
                      {error}
                    </h3>
                </div>
                )}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {data.length !== studentCount[clas] && <div className='flex gap-3'>
                <h3 className='text-white ml-3 mt-2 p-2 font-semibold'>Excel</h3>
                  <input className='w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-gray-900
                     hover:file:bg-blue-100
                     cursor-pointer
                     mt-3'
                  type="file" ref={fileRef} accept=".xlsx, .xls" onChange={handleFileUpload}
            /></div>}

            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            {data.length !== studentCount[clas] && <button className='w-full py-3 my-2 bg-teal-500 shadow-md shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            onClick = { () => {
              if(data.length === studentCount[clas]){
                toast('All student data already uploaded', {
                  position: 'bottom-center',
                  type: 'error',
                  hideProgressBar: true,
                  closeButton: false,
                  autoClose: 2000,
                  theme: 'dark',                                                              
                  style: {
                    borderRadius: '10px',
                  },
                })
              } else{
                handleOpenModal();
              }
            }}
            >Add student data manually</button>}
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button className='w-full py-3 bg-teal-500 shadow-md shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            onClick={handleEditOpenModal}
            >Edit student data</button>
            </div>
            {isModalOpen &&
                <div className='fixed inset-0 px-4 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center'>
                    <form className='max-w-[500px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8 shadow-xl shadow-gray-500/50 flex flex-col overflow-auto max-h-screen'
                        ref={formRef}
                        onSubmit={handleUploadData}>
                        <h2 className='text-2xl text-white font-bold text-center'>Add Student Data</h2>
                    <div className='mt-3 overflow-auto p-1 px-4 flex-grow border border-gray-700 rounded-lg' style={{ maxHeight: '60vh' }}>
                        <div className='flex flex-col text-gray-400 py-3'>
                          <input className='rounded-lg bg-gray-200 p-3 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type='text'
                            ref={classRef}
                            disabled
                            value={`${`Class - ${cls}`}`}
                            />
                        </div>
                        <div className='flex flex-col text-gray-400 py-2'>
                          <label>Student admission number</label>
                          <input
                            className='rounded-lg bg-gray-200 mt-1 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type="number"                                                        
                            ref={admRef}
                            onChange={(e) => setAdmissionNumber(e.target.value)}
                            required
                            placeholder='Enter student admission number'
                          />
                        </div>
                        <div className='flex flex-col text-gray-400 py-2'>
                          <label>Student name</label>
                          <input
                            className='rounded-lg bg-gray-200 mt-1 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type="text"
                            id='name'
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter student full name"
                          />
                        </div>
                        <div className='flex flex-col text-gray-400 py-2'>
                          <label>Attendance</label>
                          <input
                            className='rounded-lg bg-gray-200 mt-1 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
                            type="number"
                            id='att'
                            onChange={(e) => setAttendance(e.target.value)}
                            required
                            placeholder="Enter student attendance"
                          />
                        </div>
                        <h3 className='mt-1 text-center text-white text-base'>Enter Marks</h3>
                        {subjects.map((sub, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <div key={index} className='flex flex-col text-gray-400 py-2'>
                                <label>{sub.toUpperCase()}</label>
                                <input
                                  className='rounded-lg bg-gray-200 mt-1 p-2 focus:border-blue-500 text-gray-900 focus:outline-none'
                                  type="text"
                                  id={sub}
                                  onChange={(e) => {studentData[`${sub}`] = e.target.value} }
                                  required
                                  placeholder={`Enter ${sub} mark`}
                                />
                            </div>
                        ))}
                    </div>
                        {/*error && <p className=" mt-2 font-bold text-l text-red-500 text-center">{error}</p>*/}
                        <div className='p-2'>
                          <button className='w-full mt-2 py-2 bg-teal-500 shadow-sm shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
                          type='submit'
                          >Add data</button>
                        </div>
                        <div className='p-2'>
                          <button className='w-full py-2 bg-teal-500 shadow-sm shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
                          type='reset'
                          onClick={ () => handleCloseModal()}
                          >Close form</button>
                        </div>
                    </form>
                </div>
            }
            {isEditModalOpen &&
              <div className='fixed inset-0 px-4 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center'>
                <DataEditing clas={clas} dataLength={data.length} openModal={handleEditOpenModal} closeModal={handleEditCloseModal} onClose={onEditingComplete} />
              </div>
            }
          <ToastContainer style={{ padding: '16px',}}/>
        </div>
        </>                             
    )
}