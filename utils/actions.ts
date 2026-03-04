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

// ─── Module-level cache factories ────────────────────────────────────────────
// IMPORTANT: unstable_cache must be defined at module level (not inside async
// functions). Defining it inside a function creates a new function reference on
// every call, which defeats Next.js caching entirely — causing cache misses even
// when data exists, or silently returning nothing instead of hitting Firestore.

const studentDataCacheMap = new Map<
	string,
	() => Promise<Student | null>
>();

const getStudentDataCached = (
	selectedClass: string,
	admissionNumber: string,
): (() => Promise<Student | null>) => {
	const cacheKey = `${selectedClass}::${admissionNumber.toUpperCase()}`;
	if (!studentDataCacheMap.has(cacheKey)) {
		studentDataCacheMap.set(
			cacheKey,
			unstable_cache(
				async () => {
					console.log(
						`[CACHE MISS] Fetching student ${admissionNumber.toUpperCase()} from Firestore`,
					);
					const q = query(
						collection(db, selectedClass),
						where(
							"admission_number",
							"==",
							admissionNumber.toUpperCase(),
						),
					);
					const snapDoc = await getDocs(q);
					if (snapDoc.empty) return null;
					return {
						id: snapDoc.docs[0].id,
						...snapDoc.docs[0].data(),
					} as Student;
				},
				[
					`studentData-${selectedClass}`,
					`student-${admissionNumber.toUpperCase()}`,
				],
				{
					tags: [selectedClass, `student-${admissionNumber.toUpperCase()}`],
					revalidate: 60 * 60 * 24,
				},
			),
		);
	}
	return studentDataCacheMap.get(cacheKey)!;
};

export const getStudentData = async (
	selectedClass: string,
	admissionNumber: string,
): Promise<Student | null> => {
	try {
		const cached = await getStudentDataCached(selectedClass, admissionNumber)();

		// Fallback: if cache returns undefined/null unexpectedly, hit Firestore directly
		if (cached === undefined) {
			console.log(
				`[CACHE UNDEFINED] Falling back to direct Firestore fetch for ${admissionNumber.toUpperCase()}`,
			);
			const q = query(
				collection(db, selectedClass),
				where("admission_number", "==", admissionNumber.toUpperCase()),
			);
			const snapDoc = await getDocs(q);
			if (snapDoc.empty) return null;
			return {
				id: snapDoc.docs[0].id,
				...snapDoc.docs[0].data(),
			} as Student;
		}

		return cached;
	} catch (error) {
		console.log("Error fetching student data:", error);
		throw new Error("Error retrieving student data");
	}
};

export async function updateStudent(
	selectedClass: string,
	studentId: string,
	data: Partial<Student>,
) {
	const docRef = doc(db, selectedClass, studentId);
	try {
		await updateDoc(docRef, data);
		revalidateTag(selectedClass, {});
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

	if (studentData) {
		redirect(`/student/${studentData.id}`);
	}
}

export async function adminLogin(formData: FormData) {
	const username = formData.get("username") as string;
	const password = formData.get("password") as string;

	const credentials = username === "admin" && password === "subululhuda@02";

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

const classDataCacheMap = new Map<string, () => Promise<Student[]>>();

const getClassDataCached = (selectedClass: string): (() => Promise<Student[]>) => {
	if (!classDataCacheMap.has(selectedClass)) {
		classDataCacheMap.set(
			selectedClass,
			unstable_cache(
				async () => {
					console.log(
						`[CACHE MISS] Fetching class ${selectedClass} from Firestore`,
					);
					const querySnapshot = await getDocs(collection(db, selectedClass));
					return querySnapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					})) as Student[];
				},
				[`classData-${selectedClass}`],
				{
					tags: [selectedClass],
					revalidate: 60 * 60 * 24,
				},
			),
		);
	}
	return classDataCacheMap.get(selectedClass)!;
};

export const getClassData = async (selectedClass: string): Promise<Student[]> => {
	try {
		const cached = await getClassDataCached(selectedClass)();

		// Fallback: if cache returns undefined (e.g. corrupted entry), hit Firestore directly
		if (cached === undefined) {
			console.log(
				`[CACHE UNDEFINED] Falling back to direct Firestore fetch for ${selectedClass}`,
			);
			const querySnapshot = await getDocs(collection(db, selectedClass));
			return querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Student[];
		}

		return cached;
	} catch (error) {
		console.log(" Error fetching data :", error);
		throw new Error(" Error retrieving class data");
	}
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
			revalidateTag(selectedClass, {});
			return updatedData;
		}

		for (const student of data) {
			const { id, ...studentData } = student; // Extract id and remove from update
			const studentRef = doc(db, selectedClass, id); // Reference document
			batch.update(studentRef, studentData); // Update Firestore document
		}

		await batch.commit();
		revalidateTag(selectedClass, {});
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

