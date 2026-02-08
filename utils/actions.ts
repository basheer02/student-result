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
import { revalidateTag, unstable_cache } from "next/cache";

export const getStudentData = async (
	selectedClass: string,
	admissionNumber: string,
) => {
	const cachedData = unstable_cache(
		async () => {
			try {
				const q = query(
					collection(db, selectedClass),
					where("admission_number", "==", Number(admissionNumber)),
				);
				const snapDoc = await getDocs(q);
				if (snapDoc.empty) return null;

				return {
					id: snapDoc.docs[0].id,
					...snapDoc.docs[0].data(),
				} as Student;
			} catch (error) {
				console.log(" Error fetching data :", error);
				throw new Error(" Error retrieving student data");
			}
		},
		[`class-${selectedClass}`, `student-${admissionNumber}`],
		{
			tags: [`class-${selectedClass}`, `student-${admissionNumber}`],
		},
	);

	return cachedData();
};

export async function updateStudent(
	selectedClass: string,
	studentId: string,
	data: Partial<Student>,
) {
	const docRef = doc(db, selectedClass, studentId);
	try {
		await updateDoc(docRef, data);
		revalidateTag("class-" + selectedClass, {});
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
		console.log(selectedClass);
		studentData = await getStudentData(selectedClass, admissionNumber);

		if (!studentData) {
			throw new Error("Invalid admission number");
		}

		const cookieStore = await cookies();
		const cookie = JSON.stringify(studentData);
		cookieStore.set("student_data", cookie, {
			secure: true,
			path: "/",
			sameSite: "strict",
			httpOnly: true,
		});
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

	const credentials = username === "admin" && password === "subululhuda";

	if (credentials) {
		const cookieStore = await cookies();
		const cookie = JSON.stringify(true);
		cookieStore.set("admin_auth", cookie, {
			secure: true,
			path: "/",
			sameSite: "strict",
			httpOnly: true,
		});
		redirect("/admin");
	} else {
		throw new Error("Login failed");
	}
}

export const getClassData = async (selectedClass: string) => {
	const cachedData = unstable_cache(
		async () => {
			console.log(`[CACHE MISS] Fetching class ${selectedClass} from Firestore`);
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
		},
		[`class-${selectedClass}`],
		{
			tags: [`class-${selectedClass}`],
		},
	);

	return cachedData();
};

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
			revalidateTag("class-" + selectedClass, {});
			return updatedData;
		}

		for (const student of data) {
			const { id, ...studentData } = student; // Extract id and remove from update
			const studentRef = doc(db, selectedClass, id); // Reference document
			batch.update(studentRef, studentData); // Update Firestore document
		}

		await batch.commit();
		revalidateTag("class-" + selectedClass, {});
		return data;
	} catch (error) {
		console.log(" Error fetching data :", error);
		throw new Error(" Error retrieving class data");
	}
}

export async function logout() {
	const cookieStore = await cookies();
	cookieStore.delete("admin_auth");
}

