"use client";
import type { Student } from "@/types";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { classSubjects, studentCount } from "@/utils/class-datas";
import { addStudentData, logout, updateStudent } from "@/utils/actions";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
	AlertCircle,
	CheckCircle,
	ChevronRightIcon,
	Download,
	LogOut,
	UserCog,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
//import { saveAs } from "file-saver";

export default function TableContent({
	classData,
	columns,
	selectedClass,
}: {
	classData: Student[];
	columns: ColumnDef<Student>[];
	selectedClass: string;
}) {
	const [data, setData] = useState(classData);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>();
	const [showStudentForm, setshowStudentForm] = useState(false);

	const [isOpen, setIsOpen] = useState(false);

	const toggleDropdown = () => setIsOpen(!isOpen);
	async function signOut() {
			try {
				await logout();
				window.location.href = "/";
			} catch (error) {
				console.error("Error signing out:", error);
			}
		}

	data.sort((a, b) => {
		if (a.status === "failed") return 1;
		if (b.status === "failed") return -1;
		return a.rank - b.rank;
	});

	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const uploadButton = data.length !== studentCount[Number(selectedClass)];

	//console.log(selectedStudent)
	const subjects = classSubjects[Number(selectedClass)];

	const editStudentData = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const toastId = toast.loading("Updating...");

		const formData = new FormData(e.currentTarget);
		const updatedData: Partial<Student> = {
			admission_number: Number(formData.get("admission_no")),
			attendance: Number(formData.get("attendance")),
			name: formData.get("name") as string,
			...Object.fromEntries(
				subjects.map((subject) => [subject, Number(formData.get(subject))]),
			),
		};

		const totalMark = subjects.reduce(
			(acc, subject) => acc + Number(updatedData[subject as keyof Student]),
			0,
		);
		updatedData.total_mark = totalMark;
		const fail = ["absent", "a"];
		const status = subjects.some(
			(subject: string) =>
				Number(updatedData[subject as keyof Student]) < 18 ||
				String(updatedData[subject as keyof Student]).toLowerCase() in fail,
		)
			? "failed"
			: "passed";

		updatedData.status = status;

		if (status === "failed") {
			updatedData.rank = 0;
		}

		if (selectedStudent) {
			try {
				await updateStudent(
					`class-${selectedClass}`,
					selectedStudent.id,
					updatedData,
				);

				const isUpdateRank = !(
					selectedStudent.status === "failed" && status === "failed"
				);

				if (isUpdateRank) {
					const newData = data.map((student) =>
						student.id === selectedStudent.id
							? { ...student, ...updatedData } // Merge new marks with existing student data
							: student,
					);

					const success = await updateRank("update", newData);

					if (success) {
						toast.success("Update successful!", {
							id: toastId,
							duration: 2000,
						});
						setshowStudentForm(false);
					} else {
						toast.error("Update failed!, try again", {
							id: toastId,
							duration: 2000,
						});
					}
				} else {
					setData((prevData) =>
						prevData.map((student) =>
							student.id === selectedStudent.id
								? { ...student, ...updatedData } // Merge new marks with existing student data
								: student,
						),
					);
					toast.success("Update successful!", { id: toastId, duration: 2000 });
					setshowStudentForm(false);
				}
			} catch (error) {
				console.log(error);
				toast.error("Update failed!, try again", {
					id: toastId,
					duration: 2000,
				});
			}
		}
	};

	const updateRank = async (addOrUpdate: string, studentData: Student[]) => {
		//console.log(studentData)

		const passedStudents = studentData.filter(
			(student: { status: string }) => student.status === "passed",
		);
		const failedStudents = studentData.filter(
			(student: { status: string }) => student.status === "failed",
		);

		passedStudents.sort((a, b) => b.total_mark - a.total_mark);

		let currentRank = 1;

		for (let i = 0; i < passedStudents.length; i++) {
			const student = passedStudents[i];

			if (i > 0 && student.total_mark === passedStudents[i - 1].total_mark) {
				// If the current student's total mark is the same as the previous one, assign the same rank
				student.rank = passedStudents[i - 1].rank;
			} else {
				// Otherwise, assign the current rank
				student.rank = currentRank;
				currentRank++;
			}
		}

		try {
			//let formattedStudentData = [...passedStudents];
			if (addOrUpdate === "add") {
				const formattedStudentData = [...passedStudents, ...failedStudents];
				const res = await addStudentData(
					`class-${selectedClass}`,
					JSON.parse(JSON.stringify(formattedStudentData)),
					addOrUpdate,
				);

				if (data.length !== 0) {
					// if data already exists, update ranks
					const dataToUpdate = [...data, ...res];
					const success = await updateRank("update", dataToUpdate);
					if (success) {
						return true;
					}
					return false;
				}
				setData(res);
				return true;
			}
			await addStudentData(
				`class-${selectedClass}`,
				JSON.parse(JSON.stringify(passedStudents)),
				addOrUpdate,
			);
			setData([...passedStudents, ...failedStudents]);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0];
			const toastId = toast.loading("Uploading student data...");

			const reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = async (e) => {
				const bufferArray = e.target?.result;
				const workbook = XLSX.read(bufferArray, { type: "array" });

				const sheetName = workbook.SheetNames[0]; // Get first sheet
				const sheet = workbook.Sheets[sheetName];

				const newHeaders = [
					"admission_number",
					"name",
					"attendance",
					...subjects,
				];

				const sheetData: Student[] = XLSX.utils.sheet_to_json(sheet, {
					header: newHeaders,
				});

				const dataRows = sheetData.slice(1);
				const fail = ["absent", "a"];
				for (const student of dataRows) {
					student.class = selectedClass;

					const status = subjects.some(
						(subject: string) =>
							Number(student[subject as keyof Student]) < 18 ||
							String(student[subject as keyof Student]).toLowerCase() in fail,
					)
						? "failed"
						: "passed";

					const totalMarks = subjects.reduce(
						(acc, subject) =>
							acc + (Number(student[subject as keyof Student]) || 0),
						0,
					);

					student.total_mark = totalMarks;
					student.status = status;

					if (status === "failed") {
						student.rank = 0;
					}
				}

				const success = await updateRank("add", dataRows);
				if (success) {
					toast.success("Upload successful!", { id: toastId, duration: 2000 });
				} else {
					toast.error("Upload failed!, try again", {
						id: toastId,
						duration: 2000,
					});
				}
			};
		}
	};

	const downloadPDF = () => {
		setIsOpen(false);
		if (data.length === 0) {
			toast.error("No data to download!");
		} else {
			const toastId = toast.loading("Downloading student data...");
			const doc = new jsPDF();
			const cols = ["no", "admission_number", "name", "attendance"];

			for (const value of Object.values(subjects)) {
				cols.push(value);
			}

			cols.push("total_mark","status", "rank");
			const rows = Object.values(data).map((obj, index) => [
				index + 1,
				...cols.slice(1).map((key) => String(obj[key as keyof Student] ?? "")),
			]);
			cols[1] = "adm";
			cols[3] = "hajar";
			cols[cols.length - 3] = "total";
			const colIndex = cols.indexOf("lis_quran");
			if (colIndex !== -1) {
				cols[colIndex] = "lisan";
			}
			
			if(selectedClass === "1"){
				cols[4] = "thafhim(R)";
				cols[5] = "thafhim(W)";
				cols[6] = "duroos(R)";
				cols[7] = "duroos(W)";
				cols[9] = "listen";
			}

			const text = ` Total students : ${data.length}/${studentCount[Number(selectedClass)]}`;
			doc.setFontSize(12);
			doc.text(` Class-${selectedClass}`, 12, 10, { align: "left" });
			doc.text(text, 12, 14, { align: "left" });

			autoTable(doc, {
				head: [cols],
				body: rows,
				margin: { top: 20 },
				styles: { cellPadding: 2, fontSize: 8 },
				tableWidth: "wrap",
				showHead: "everyPage",
				theme: "grid",
			});
			// autoTable(doc, {
			// 	head: [cols],
			// 	body: rows,
			// });

			doc.save(`Class_${selectedClass}_data.pdf`);
			toast.success("Download successful!", { id: toastId, duration: 2000 });
		}
	};

	const generatePDF = () => {
		const toastId = toast.loading("Downloading mark list...");
		const doc = new jsPDF();


		// Calculate total width of the table
		const pageWidth = doc.internal.pageSize.getWidth();
		const marginLeft = (pageWidth - 140) / 2;

		let startY = 5;

		for (const student of data) {
			// Student details
			const studentDetails = [
				["Admission Number", student.admission_number],
				["Class", selectedClass],
				["Name", student.name],
			];

			autoTable(doc, {
				startY,
				body: studentDetails,
				theme: "grid",
				styles: { halign: "center", fontSize: 12 },
				headStyles: { fillColor: [22, 160, 133] },
				columnStyles: {
					0: { cellWidth: 70, textColor: [0, 0, 0] }, // First column width
					1: { cellWidth: 70, textColor: [0, 0, 0], fontStyle: "bold" }, // Second column width
				},
				margin: { left: marginLeft, right: marginLeft },
			});

			// Add a gap between student details
			startY += 40;

			// Check if the next student details will exceed the page height
			if (startY + 40 > doc.internal.pageSize.getHeight()) {
				if (data.indexOf(student) !== data.length - 1) {
					doc.addPage();
				}
				startY = 10; // Reset startY for the new page
			}
		}
		
		//let startY = 50;
		
		// Save the PDF
		doc.save(`class_${selectedClass}_list.pdf`);
		toast.success("Download successful!", { id: toastId, duration: 2000 });
	};

	// async function exportToExcel() {
	// 	try {
	// 		// Create a worksheet and workbook
	// 		const worksheet = XLSX.utils.json_to_sheet(data);
	// 		const workbook = XLSX.utils.book_new();
	// 		XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

	// 		// Generate and trigger the file download
	// 		const excelBuffer = XLSX.write(workbook, {
	// 			bookType: "xlsx",
	// 			type: "array",
	// 		});
	// 		const excelBlob = new Blob([excelBuffer], {
	// 			type: "application/octet-stream",
	// 		});

	// 		saveAs(excelBlob, "students.xlsx"); // File download
	// 	} catch (error) {
	// 		console.error("Error exporting data:", error);
	// 	}
	// }
	return (
		<div className="flex flex-col shadow-md mx-auto p-4">
			<div className="absolute top-4 right-4 z-50">
				<Button
					variant={"ghost"}
					className="bg-gray-200 hover:bg-gray-200"
					onClick={toggleDropdown}
				>
					<ChevronRightIcon
						className={`mr-2 text-gray-900 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
						size={20}
					/>
					<UserCog className="text-gray-900" size={24} />
					<span className="mr-2 ml-2 font-bold text-gray-900">{`class-${selectedClass}`}</span>
				</Button>
				{isOpen && (
					<div className="absolute bg-gray-200">
						<Button
							variant={"ghost"}
							className="bg-gray-200 rounded hover:bg-gray-200"
							onClick={generatePDF}
						>
							<Download className="ml-4 text-gray-900" size={24} />
							<span className="mr-2 ml-2 text-gray-900">Download</span>
						</Button>
						<Button
							variant={"ghost"}
							className="bg-gray-200 hover:bg-gray-200"
							onClick={signOut}
						>
							<LogOut className="ml-4 text-gray-900" size={24} />
							<span className="mr-2 ml-2 text-gray-900">Logout</span>
						</Button>
					</div>
				)}
			</div>
			<div className="flex bg-white border shadow-md max-h-[70vh]">
				<Table className="overflow-auto">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className="sticky top-0 p-2 text-center font-bold uppercase tracking-wider bg-gray-300 border border-gray-400"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row, index) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="cursor-pointer border border-gray-300 bg-gray-100 text-center"
											onClick={() => {
												setSelectedStudent(data[index]);
												setshowStudentForm(true);
											}}
										>
											{cell.column.id === "sl_no" ? (
												index + 1
											) : cell.column.id === "status" ? (
												<span
													className={`${data[index].status === "failed" ? "text-red-700" : "text-green-700"}`}
												>
													{data[index].status}
												</span>
											) : (
												flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No Students.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="p-3 flex">
				<span className="text-gray-200">{`Total student data added : ${data.length}/${studentCount[Number(selectedClass)]}`}</span>
				{data.length === studentCount[Number(selectedClass)] ? (
					<CheckCircle size={24} className="h-4 w-4 m-1 ml-4" color="green" />
				) : (
					<AlertCircle size={24} className="h-4 w-4 m-1 ml-4" color="red" />
				)}
			</div>
			{uploadButton && (
				<div className="flex mt-1">
					<Label className="text-white m-2 font-semibold w-[110px]">
						Upload data
					</Label>
					<Input
						type="file"
						className="text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-100 file:text-gray-900
                     hover:file:bg-blue-200
										 border-gray-900
                     file:cursor-pointer
										 bg-transparent
                     "
						accept=".xlsx, .xls"
						onChange={handleFileUpload}
					/>
				</div>
			)}

			{showStudentForm && (
				<div className="fixed inset-0 px-4 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center">
					<div className="w-[768px] md:w-[768px] h-[80vh] p-6 overflow-auto p-4 bg-gray-200 rounded-md mt-2">
						<h2 className="text-center font-bold mb-2">Edit Student Marks</h2>
						<form onSubmit={editStudentData}>
							<div className="p-2">
								<Input
									className="font-semibold text-sm bg-gray-100"
									type="text"
									value={`Class - ${selectedClass}`}
									disabled
								/>
							</div>
							<div className="p-2">
								<Label htmlFor="name">Admission no.</Label>
								<Input
									type="number"
									className="bg-gray-100"
									name="admission_no"
									defaultValue={selectedStudent?.admission_number}
								/>
							</div>
							<div className="p-2">
								<Label htmlFor="name">Name</Label>
								<Input
									type="text"
									className="bg-gray-100"
									defaultValue={selectedStudent?.name}
									name="name"
								/>
							</div>
							<div className="p-2">
								<Label htmlFor="question">Attendance</Label>
								<Input
									type="number"
									name="attendance"
									className="bg-gray-100"
									defaultValue={selectedStudent?.attendance}
								/>
							</div>
							{subjects.map((subject) => (
								<div key={subject} className="p-2">
									<Label htmlFor="question">{subject.toUpperCase()}</Label>
									<Input
										name={subject}
										type="number"
										className="bg-gray-100"
										defaultValue={selectedStudent?.[subject as keyof Student]}
									/>
								</div>
							))}
							<div className="flex justify-end">
								<Button
									className="m-4 px-6 py-2"
									onClick={() => setshowStudentForm(false)}
								>
									Cancel
								</Button>
								<Button className="m-4 px-6 py-2" type="submit">
									Update
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
