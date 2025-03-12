"use server";
import {
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
	writeBatch,
} from "firebase/firestore";
import { db } from "./db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Student } from "@/types";

async function getStudentDataByID(selectedClass: string, reg: string) {
	try {
		const q = query(
			collection(db, selectedClass),
			where("admission_number", "==", Number(reg)),
		);
		const snapDoc = await getDocs(q);
		// const dataList = snapDoc.docs.map((doc) => ({
		// 	id: doc.id,
		// 	...doc.data(),
		// }));
		return snapDoc;
	} catch (error) {
		console.log(" Error fetching data :", error);
		throw new Error(" Error retrieving student data");
	}
}

export async function updateStudent(
	selectedClass: string,
	studentId: string,
	data: Partial<Student>,
) {
	const docRef = doc(db, selectedClass, studentId);
	try {
		await updateDoc(docRef, data);
	} catch (error) {
		console.log("Error updating student data :", error);
		throw new Error("Error updating student data");
	}
}

export async function studentLogin(
	selectedClass: string,
	admissionNumber: string,
) {
	let studentData: Student | null;

	try {
		const student = await getStudentDataByID(selectedClass, admissionNumber);

		if (student.empty) {
			throw new Error("Invalid admission number");
		}

		studentData = student.docs[0].data() as Student;
		const cookieStore = await cookies();
		const cookie = JSON.stringify(studentData);
		cookieStore.set("student_data", cookie, {
			secure: true,
			path: "/",
			sameSite: "strict",
			httpOnly: true,
		});
		studentData.id = student.docs[0].id;
	} catch (error) {
		console.log(error);
		throw new Error("Error retrieving student data");
	}

	if (studentData !== null) {
		if ((await cookies()).get("student_data")) {
			redirect(`/student/${studentData.id}`);
		}
	}
}

export async function adminLogin(formData: FormData) {
	const username = formData.get("username") as string;
	const password = formData.get("password") as string;

	const clas = username.length === 6 ? username.slice(-1) : username.slice(-2);
	const credentials = password === username;

	if (credentials && +clas <= 12 && +clas >= 1) {
		const original = `class-${clas}`;
		const id = Buffer.from(original, "utf-8").toString("hex");
		redirect(`/admin/${id}`);
	} else {
		throw new Error("Login failed");
	}
}

export async function getClassData(selectedClass: string) {
	try {
		const querySnapshot = await getDocs(collection(db, selectedClass));
		const dataList = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return dataList;
	} catch (error) {
		console.log(" Error fetching data :", error);
		throw new Error(" Error retrieving class data");
	}
}

export async function addStudentData(
	selectedClass: string,
	data: Student[],
	addOrUpdate: string,
) {
	try {
		const batch = writeBatch(db);

		if (addOrUpdate === "add") {
			const classCollection = collection(db, selectedClass);
			const updatedData = data.map((student) => {
				const studentRef = doc(classCollection); // Auto-generate student ID
				const updatedStudent = { ...student, id: studentRef.id }; // Create a new object
				batch.set(studentRef, student); // Store in Firestore batch

				return updatedStudent; // Add updated student to new array
			});

			await batch.commit();
			return updatedData;
		}

		for (const student of data) {
			const { id, ...studentData } = student; // Extract id and remove from update
			const studentRef = doc(db, selectedClass, id); // Reference document
			batch.update(studentRef, studentData); // Update Firestore document
		}

		await batch.commit();
		return data;
	} catch (error) {
		console.log(" Error fetching data :", error);
		throw new Error(" Error retrieving class data");
	}
}
