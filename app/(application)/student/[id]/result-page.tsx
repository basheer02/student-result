"use client";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { classSubjects, malayalamText, subjectText } from "@/utils/class-datas";
import type { Student } from "@/types";
import { Button } from "@/components/ui/button";
import autoTable from "jspdf-autotable";
import { redirect } from "next/navigation";

export default function ResultPage({ studentData }: { studentData: Student }) {
	const subjects = classSubjects[Number(studentData.class)];

	const schoolName = "SUBULULHUDA HIGHER SECONDARY MADRASA";

	const TableItem = ({
		title,
		value,
		textPos = "",
		textColor = "text-gray-900",
	}: {
		title: string;
		value: string | number | undefined;
		textPos: string;
		textColor: string;
	}) => (
		<tr className="border-b border-gray-300">
			<td
				className={`w-1/2 ${textPos} text-sm text-gray-900 font-semibold border-r border-gray-300 p-2`}
			>
				{title}
			</td>
			<td
				className={`w-1/2 ${textPos} text-sm font-semibold break-words p-2 ${textColor}`}
			>
				{value}
			</td>
		</tr>
	);

	const generatePDF = () => {
		const doc = new jsPDF();

		// Set school name at the top
		doc.setFontSize(16);
		doc.setFont("Helvetica", "bold");
		doc.text(schoolName, 105, 20, { align: "center" }); // Centered text

		doc.setFontSize(12);
		doc.setFont("Helvetica", "normal");
		doc.text("CHENAKKALANGADI, MALAPPURAM", 105, 27, { align: "center" });

		const margin = 10;
		doc.setFontSize(14);
		doc.setFont("Helvetica", "bold");
		doc.text("Student Mark List", 105, 30 + margin, { align: "center" }); // Centered text below the school name

		// Student details
		const studentDetails = [
			["Admission Number", studentData.admission_number],
			["Class", studentData.class],
			["Student Name", studentData.name],
		];

		let startY = 50;

		// Calculate total width of the table
		const pageWidth = doc.internal.pageSize.getWidth();
		const marginLeft = (pageWidth - 140) / 2;

		autoTable(doc, {
			startY,
			body: studentDetails,
			theme: "grid",
			styles: { halign: "center", fontSize: 12 },
			headStyles: { fillColor: [22, 160, 133] },
			columnStyles: {
				0: { cellWidth: 70, textColor: [0, 0, 0], fontStyle: "bold" }, // First column width
				1: { cellWidth: 70, textColor: [0, 0, 0] }, // Second column width
			},
			margin: { left: marginLeft, right: marginLeft },
		});

		startY = 85;

		// Subjects and marks
		const subjectRows = subjects.map((subject) => [
			subjectText[subject].toUpperCase(),
			studentData[subject as keyof Student],
		]);

		autoTable(doc, {
			startY,
			head: [["Subject", "Mark"]],
			body: subjectRows as (string | number)[][],
			theme: "grid",
			styles: { halign: "center" },
			headStyles: { fillColor: [22, 160, 133] },
			columnStyles: {
				0: { cellWidth: 70, textColor: [0, 0, 0], fontStyle: "bold" }, // Subject column width
				1: { cellWidth: 70, textColor: [0, 0, 0] }, // Mark column width
			},
			margin: { left: marginLeft, right: marginLeft },
		});

		const totalMark = [
			["TOTAL MARK", studentData.total_mark],
			["STATUS", studentData.status],
		];

		if (subjects.length === 2) { 
			startY = 113;
		} else if (subjects.length === 4) {
			startY = 128;
		} else if (subjects.length === 6) {
			startY = 143;
		} else if (subjects.length > 6) {
			startY = 158;
		}

		autoTable(doc, {
			startY,
			body: totalMark,
			theme: "grid",
			styles: {
				halign: "center",
				fontSize: 10,
				textColor: [0, 0, 0],
				fontStyle: "bold",
			},
			headStyles: { fillColor: [22, 160, 133] },
			columnStyles: {
				0: { cellWidth: 70, fontStyle: "bold" }, // First column width
				1: { cellWidth: 70 }, // Second column width
			},
			margin: { left: marginLeft, right: marginLeft },
		});

		// Save the PDF
		doc.save(`${studentData.name}_marklist.pdf`);
	};

	return (
		<div className="flex flex-col bg-gray-900 md:w-[calc(100vw-500px)] w-md h-screen mx-auto shadow-md p-2">
			<div className="relative">
				<h3 className="mt-2 text-2xl text-white font-bold text-center">
					SUBULULHUDA HIGHER SECONDARY MADRASA
				</h3>
				<h2 className="mt-2 text-white text-lg text-center font-bold">
					Examination Result
				</h2>
			</div>
			<div className="flex mt-2 grid p-4 bg-white w-full rounded-lg mt-4 py-2 overflow-x-auto">
				<table className="w-full mt-4 mb-4 border-spacing-0 bg-gray-100 shadow-md border border-gray-300 rounded-lg">
					<tbody>
						<TableItem
							title="Admission no."
							value={studentData.admission_number}
							textPos={""}
							textColor={""}
						/>
						<TableItem
							title="Class"
							value={studentData.class}
							textPos={""}
							textColor={""}
						/>
						<TableItem
							title="Name"
							value={studentData.name}
							textPos={""}
							textColor={""}
						/>
						<TableItem
							title="Attendance"
							value={studentData.attendance}
							textPos={""}
							textColor={""}
						/>
					</tbody>
				</table>
				<h2 className="mt-2 mb-3 text-gray-900 text-lg text-center font-bold">
					Mark List
				</h2>
				<table className="w-full mt-4 mb-4 border-spacing-0 bg-gray-100 shadow-md border rounded-lg border-gray-300">
					<thead>
						<tr className="border-b border-gray-300 bg-gray-300">
							<th className="text-center text-gray-900 font-semibold p-2">
								Subject
							</th>
							<th className="text-center text-gray-900 font-semibold p-2">
								Mark
							</th>
						</tr>
					</thead>
					<tbody>
						{subjects.map((subject) => (
							<TableItem
								key={subject}
								title={malayalamText[subject]}
								value={studentData[subject as keyof Student]}
								textPos="text-center"
								textColor={""}
							/>
						))}
					</tbody>
				</table>
				<table className="w-full mt-4 mb-4 border-spacing-0 bg-gray-100 shadow-md border rounded-lg border-gray-300">
					<tbody>
						<TableItem
							title="Total Mark"
							value={studentData.total_mark}
							textPos="text-center"
							textColor={""}
						/>
						<TableItem
							title="Status"
							value={studentData.status}
							textPos="text-center"
							textColor={
								studentData.status === "failed"
									? "text-red-900"
									: "text-green-900"
							}
						/>
						{studentData.status === "passed" && (
							<TableItem
								title="Rank"
								value={studentData.rank}
								textPos="text-center"
								textColor={""}
							/>
						)}
					</tbody>
				</table>
				<Button
					variant={"default"}
					className="m-4 p-2"
					onClick={() => {
						generatePDF();
					}}
				>
					<Download />
					<span>Download Mark List</span>
				</Button>
			</div>
			<Button
				variant={"secondary"}
				className="mt-4 p-2 bg-teal-700 text-white hover:bg-teal-600"
				onClick={() => redirect("/")}
			>
				Check another result
			</Button>
		</div>
	);
}
