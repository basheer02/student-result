

import { db } from "../../lib/firebase";
import { setDoc, doc} from "firebase/firestore";


export const classSubjects = {
    1: ['writing','reading'],
    2: ["qur'an", 'hifl', 'fiqh', 'aqeeda', "lis qur'an", 'aqlaq'],
    3: ["qur'an", 'hifl', 'fiqh', 'aqeeda', "lis qur'an", 'aqlaq', 'tariq', 'tajvid'],
    4: ["qur'an", 'hifl', 'fiqh', 'aqeeda', "lis qur'an", 'aqlaq', 'tariq', 'tajvid'],
    5: ["qur'an", 'hifl', 'fiqh', 'aqeeda', "lis qur'an", 'aqlaq', 'tariq', 'tajvid'],
    6: ["qur'an", 'hifl', 'fiqh', 'tariq', 'dur ihsan', "lis qur'an"],
    7: ["qur'an", 'hifl', 'fiqh', 'tariq', 'dur ihsan', "lis qur'an"],
    8: ['fiqh', 'tariq', 'dur ihsan', "lis qur'an"],
    9: ['fiqh', 'tariq', 'dur ihsan', "lis qur'an"],
    10: ['fiqh', 'tafsir', 'dur ihsan', "lis qur'an"],
    11: ['fiqh', 'tafsir', 'dur ihsan', "lis qur'an"],
    12: ['fiqh', 'tafsir', 'dur ihsan', "lis qur'an"]
}

export const malayalamText = {
  writing: 'തഫ്ഹീമു തിലാവ (എഴുത്ത്)',
  reading: 'തഫ്ഹീമു തിലാവ (വായന)',
  "qur'an": 'ഖുർആൻ',
  hifl: 'ഹിഫ്ൾ',
  fiqh: 'ഫിഖ്ഹ്',
  aqeeda: 'അഖീദ',
  "lis qur'an": 'ലിസാനുൽ ഖുർആൻ',
  aqlaq: 'അഖ്ലാഖ്',
  tariq: 'താരിഖ്',
  tajvid: 'തജ് വീദ്',
  "dur ihsan": 'ദുറുസുൽ ഇഹ്സാൻ',
  tafsir: 'തഫ്സീർ'
}

export const studentCount = {
  1: 42,
  2: 52,
  3: 50,
  4: 47,
  5: 48,
  6: 49,
  7: 28,
  8: 32,
  9: 35,
  10: 33,
  11: 20,
  12: 11
}


export const updateRank = async (data, cl) => {

  for (const student of data) {
    if (classSubjects[cl].some(subject => +student[subject] < 18 || student[subject] === 'A')) {
      student.rank = 'failed';
    }
  }
  
  // Filter out failed students and sort the rest by total marks
  const passedStudents = data.filter(student => student.rank !== 'failed');
  passedStudents.sort((a, b) => b["total mark"] - a["total mark"]);
  
  // Assign ranks to the passed students, considering ties
  let currentRank = 1;

  for (let i = 0; i < passedStudents.length; i++) {
    const student = passedStudents[i];

    if (i > 0 && student["total mark"] === passedStudents[i - 1]["total mark"]) {
      // If the current student's total mark is the same as the previous one, assign the same rank
      student.rank = passedStudents[i - 1].rank;
    } else {
      // Otherwise, assign the current rank
      student.rank = currentRank;
      currentRank++;
    }

    // Find the index of the student in the original data array and update their rank
    const studentIndex = data.findIndex(s => s.id === student.id);
    if (studentIndex !== -1) {
      data[studentIndex].rank = student.rank;
    }
  }

  try {

    const updatePromises = data.map(async (student) => {
      const docRef = doc(db, 'subululhuda', String(student.id));
      await setDoc(docRef, { rank: student.rank }, { merge: true });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises); 

    return ['success', 'Student rank updated']
    
  } catch (error) {

    return ['error', 'Error in updating rank, try again']
    
  }
}