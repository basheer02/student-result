"use server";
import type { Student } from "@/types";
import { cookies } from "next/headers";
import ResultPage from "./result-page";

export default async function Page() {
	try {
		const cookie = (await cookies()).get("student_data");
		if (!cookie) {
			throw new Error("Student data cookie not found");
		}

		const studentData = JSON.parse(cookie.value) as Student;

		return (
			<div>
				<ResultPage studentData={studentData} />
			</div>
		);
	} catch (error) {
		return (
			<main className="w-full h-screen items-center justify-center">
				<p className="font-bold text-center justify-center text-white text-xl">{`Error fetching data...${error}, please reload the page`}</p>
			</main>
		);
	}
}
