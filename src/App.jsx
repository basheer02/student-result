import React from 'react';
import './index.css';

import { useLocation } from 'react-router-dom';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { classSubjects, malayalamText } from './components/classDatas';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

function App() {

  const location = useLocation();
  const { userData, admNumber } = location.state || {};

  console.log();

  /**toast.success('Login Successfull', {
    autoClose: 2000,
    position: 'bottom-center',
    hideProgressBar: false,
  });*/

  const subjects = classSubjects[userData.class];
  
  const status = () => {
    if(+userData.rank === 1){
      return '1st'
    } 
    if(+userData.rank === 2){
      return '2nd'
    }
    if(+userData.rank === 3){
      return '3rd'
    }

    return userData.rank
  }

  const schoolName = 'SUBULULHUDA HIGHER SECONDARY MADRASA';


  const generatePDF = () => {
    const doc = new jsPDF();

    // Set school name at the top
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text(schoolName, 105, 20, null, null, 'center'); // Centered text

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text('CHENAKKALANGADI, MALAPPURAM', 105, 27, null, null, 'center');

    const margin = 10;
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('Student Mark List', 105, 30 + margin, null, null, 'center'); // Centered text below the school name
    
    // Student details
    const studentDetails = [
      ['Admission Number', admNumber],
      ['Class', userData.class],
      ['Student Name', userData.name]
    ];

    let startY = 50;

    // Calculate total width of the table
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = (pageWidth - 140) / 2;

    doc.autoTable({
      startY,
      body: studentDetails,
      theme: 'grid',
      styles: { halign: 'center', fontSize: 12 },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        0: { cellWidth: 70, textColor: [0,0,0], fontStyle: 'bold' }, // First column width
        1: { cellWidth: 70, textColor: [0,0,0] }, // Second column width
      },
      margin: { left: marginLeft, right: marginLeft }
    });

    startY = doc.lastAutoTable.finalY + 10;

    // biome-ignore lint/style/useConst: <explanation>
    let  sub = {
      writing: 'Tafheemu Tilawa (Writing)',
      reading: 'Tafheemu Tilawa (Reading)'
    }
    
    // Subjects and marks
    const subjectRows = subjects.map((subject) => [
      (sub[subject] || subject).toUpperCase(),
      userData[subject]
    ]);

    doc.autoTable({
      startY,
      head: [['Subject', 'Mark']],
      body: subjectRows,
      theme: 'grid',
      styles: { halign: 'center' },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        0: { cellWidth: 70, textColor: [0,0,0], fontStyle: 'bold' }, // Subject column width
        1: { cellWidth: 70, textColor: [0,0,0] }, // Mark column width
      },
      margin: { left: marginLeft, right: marginLeft }
    });

    const totalMark = [
      ['TOTAL MARK', userData['total mark']],
      [status() === 'failed' ? 'STATUS' : 'RANK', status()]
    ]

    startY = doc.lastAutoTable.finalY + 5;

    doc.autoTable({
      startY,
      body: totalMark,
      theme: 'grid',
      styles: { halign: 'center', fontSize: 10, textColor: [0,0,0], fontStyle: 'bold' },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' }, // First column width
        1: { cellWidth: 70 }, // Second column width
      },
      margin: { left: marginLeft, right: marginLeft }
    });
  
    // Save the PDF
    doc.save(`${userData.name}_marklist.pdf`);
    toast('Mark list download has started',{
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
  };




  const GridItem = ({ title, value }) => (
    <div className="grid grid-cols-2 bg-gray-100 px-4 p-2 shadow-md">
      <div className="pr-4 pt-2 border-r border-gray-400">
        <h3 className="text-sm text-gray-900 font-semibold break-words">{title}</h3>
      </div>
      <div className="pl-4">
        <h3 className="mt-2 text-base text-gray-900 font-semibold break-words">{value}</h3>
      </div>
    </div>
  );


  return (
    <>
    <div className="flex flex-col max-w-md h-screen lg:w-2/3 xl:w-1/3 mx-auto shadow-md p-2">
      <div className='relative'>
        <h2 className='mt-4 text-white text-lg text-center font-bold'>Examination Result</h2>
        <div className='absolute top-4 right-2 bg-gray-200 rounded-lg border border-gray-500 p-1 px-4'>
          <FontAwesomeIcon icon={faDownload} className='text-gray-900 cursor-pointer' size='sm'
          onClick={generatePDF} />
        </div>
      </div>
      <div className='mt-8 grid p-4 bg-white w-full rounded-lg mt-4 py-2'>
        <GridItem title="ADMISSION NO." value={admNumber} />
        <GridItem title="CLASS" value={userData.class} />
        <GridItem title="NAME" value={userData.name} />
        <GridItem title="ATTENDANCE" value={userData.attendance}/>
      </div>
      <div className='mt-1 overflow-y-auto overflow-hidden p-4 bg-white w-full rounded-lg py-2'>
        <h2 className='mt-2 mb-3 text-gray-900 text-lg text-center font-bold'>Mark List</h2>
        {subjects.map((subject, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <GridItem key={index} title={malayalamText[subject]} value={userData[subject]} />
        ))}
        <GridItem title='TOTAL MARK' value={userData['total mark']} />
      </div>
      <div className='flex flex-col bg-white w-full rounded-lg shadow-md mt-3 py-1'>
        <h2 className={`mt-2 mb-3 text-lg text-center font-bold ${status() === 'Failed' ? 'text-red-900' : 'text-green-900'}`}>{status() === 'failed' ? 'Status' : 'Rank'} - {status()}</h2>
      </div>
      <ToastContainer style={{ padding: '16px',}}/>
    </div>
    </>
  );
}

export default App;
