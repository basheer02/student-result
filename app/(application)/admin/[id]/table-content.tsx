"use client";
import type { Student } from "@/types";
import { useState, useMemo } from "react";
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
	CheckCircle2,
	ChevronRightIcon,
	Download,
	LogOut,
	MoreVertical,
	UploadCloud,
	Pencil,
	Search
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
	const [searchTerm, setSearchTerm] = useState("");

	async function signOut() {
		const toastId = toast.loading("Signing out...");
		try {
			await logout();
			toast.success("Signed out successfully", { id: toastId });
			window.location.href = "/";
		} catch (error) {
			toast.error("Error signing out", { id: toastId });
			console.error("Error signing out:", error);
		}
	}

	const sortedData = useMemo(() => {
		return [...data].sort((a, b) => {
			if (a.status === "failed") return 1;
			if (b.status === "failed") return -1;
			return a.rank - b.rank;
		});
	}, [data]);

	// Filter data based on search
	const filteredData = useMemo(() => {
		return sortedData.filter(student =>
			student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.admission_number.toString().includes(searchTerm)
		);
	}, [sortedData, searchTerm]);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const uploadButton = useMemo(() => data.length !== studentCount[Number(selectedClass)], [data.length, selectedClass]);
	const subjects = useMemo(() => classSubjects[Number(selectedClass)], [selectedClass]);

	const editStudentData = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const toastId = toast.loading("Updating records...");

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
							? { ...student, ...updatedData }
							: student,
					);

					const success = await updateRank("update", newData);

					if (success) {
						toast.success("Student updated successfully!", {
							id: toastId,
							duration: 2000,
						});
						setshowStudentForm(false);
					} else {
						toast.error("Failed to re-calculate ranks.", {
							id: toastId,
							duration: 2000,
						});
					}
				} else {
					setData((prevData) =>
						prevData.map((student) =>
							student.id === selectedStudent.id
								? { ...student, ...updatedData }
								: student,
						),
					);
					toast.success("Student updated successfully!", { id: toastId, duration: 2000 });
					setshowStudentForm(false);
				}
			} catch (error) {
				console.log(error);
				toast.error("Update failed. Check connection.", {
					id: toastId,
					duration: 2000,
				});
			}
		}
	};

	const updateRank = async (addOrUpdate: string, studentData: Student[]): Promise<boolean> => {
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
				student.rank = passedStudents[i - 1].rank;
			} else {
				student.rank = currentRank;
				currentRank++;
			}
		}

		try {
			if (addOrUpdate === "add") {
				const formattedStudentData = [...passedStudents, ...failedStudents];
				const res = await addStudentData(
					`class-${selectedClass}`,
					JSON.parse(JSON.stringify(formattedStudentData)),
					addOrUpdate,
				);

				if (data.length !== 0) {
					const dataToUpdate = [...data, ...res];
					const success = await updateRank("update", dataToUpdate);
					return success;
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
			const toastId = toast.loading("Processing upload...");

			const reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = async (e) => {
				const bufferArray = e.target?.result;
				const workbook = XLSX.read(bufferArray, { type: "array" });

				const sheetName = workbook.SheetNames[0];
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
					toast.success("Data uploaded successfully!", { id: toastId, duration: 2000 });
				} else {
					toast.error("Upload failed.", {
						id: toastId,
						duration: 2000,
					});
				}
			};
		}
	};

	const generatePDF = () => {
		const toastId = toast.loading("Generating class report...");
		const doc = new jsPDF();

		const pageWidth = doc.internal.pageSize.getWidth();
		const marginLeft = (pageWidth - 140) / 2;

		let startY = 5;

		for (const student of data) {
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
					0: { cellWidth: 70, textColor: [0, 0, 0] },
					1: { cellWidth: 70, textColor: [0, 0, 0], fontStyle: "bold" },
				},
				margin: { left: marginLeft, right: marginLeft },
			});

			startY += 40;

			if (startY + 40 > doc.internal.pageSize.getHeight()) {
				if (data.indexOf(student) !== data.length - 1) {
					doc.addPage();
				}
				startY = 10;
			}
		}

		doc.save(`class_${selectedClass}_list.pdf`);
		toast.success("PDF Downloaded!", { id: toastId, duration: 2000 });
	};

	return (
		<div className="flex flex-col p-4 md:p-6 w-full max-w-[1600px] mx-auto space-y-6">
			{/* Action Toolbar */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
				<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
					<h2 className="text-xl font-bold text-white flex items-center">
						<span className="text-teal-400 mr-2">Class {selectedClass}</span>
						<span className="text-gray-500 text-sm font-normal">| Management</span>
					</h2>
					<div className="hidden md:block h-6 w-px bg-white/10" />
					<div className="flex items-center text-sm">
						<span className="text-gray-400 mr-2">Status:</span>
						{data.length === studentCount[Number(selectedClass)] ? (
							<span className="flex items-center text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
								<CheckCircle2 size={14} className="mr-1" /> Complete
							</span>
						) : (
							<span className="flex items-center text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
								<AlertCircle size={14} className="mr-1" />
								{data.length}/{studentCount[Number(selectedClass)]} Uploaded
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3 w-full md:w-auto">
					<div className="relative w-full md:w-64">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
						<Input
							placeholder="Search student..."
							className="pl-9 bg-gray-800/50 border-gray-700 text-gray-200 focus:ring-teal-500/50"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="border-gray-700 bg-gray-800/50 text-gray-200 hover:bg-gray-800">
								<MoreVertical className="w-4 h-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-gray-900 border-gray-800 text-gray-200 md:mr-20 mr-8 mt-2">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator className="bg-gray-800" />
							<DropdownMenuItem onClick={generatePDF} className="hover:bg-gray-800 cursor-pointer">
								<Download className="mr-2 h-4 w-4" /> Download Report
							</DropdownMenuItem>
							<DropdownMenuItem onClick={signOut} className="hover:bg-red-900/20 text-red-400 cursor-pointer">
								<LogOut className="mr-2 h-4 w-4" /> Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* File Upload Area - Only show if incomplete */}
			{uploadButton && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className="bg-indigo-500/10 border border-indigo-500/20 border-dashed rounded-xl p-6 text-center"
				>
					<div className="flex flex-col items-center justify-center space-y-3">
						<div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
							<UploadCloud className="text-indigo-400 h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white">Upload Class Data</h3>
							<p className="text-sm text-gray-400">Drag and drop excel file or click to browse</p>
						</div>
						<div className="relative group">
							<Input
								type="file"
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
								accept=".xlsx, .xls"
								onChange={handleFileUpload}
							/>
							<Button variant="secondary" className="bg-indigo-600 hover:bg-indigo-500 text-white pointer-events-none">
								Select Excel File
							</Button>
						</div>
					</div>
				</motion.div>
			)}

			{/* Data Table */}
			<div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-gray-950/50 backdrop-blur-sm">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-gray-900/80">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="border-b border-white/5 hover:bg-transparent">
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id}
												className="text-center font-bold text-gray-300 uppercase tracking-wider text-xs py-4 h-auto"
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
									<TableHead className="text-center font-bold text-gray-300 uppercase tracking-wider text-xs py-4 h-auto">Actions</TableHead>
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row, index) => (
									<TableRow
										key={row.id}
										className={`
											border-b border-white/5 hover:bg-white/5 transition-colors
											${index % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'}
										`}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="text-center text-gray-300 py-3"
											>
												{cell.column.id === "sl_no" ? (
													<span className="text-gray-500 font-mono text-xs">{index + 1}</span>
												) : cell.column.id === "status" ? (
													<span
														className={`
															inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
															${row.original.status === "failed"
																? "bg-red-500/10 text-red-400 border-red-500/20"
																: "bg-green-500/10 text-green-400 border-green-500/20"}
														`}
													>
														{row.original.status}
													</span>
												) : (
													flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)
												)}
											</TableCell>
										))}
										<TableCell className="text-center">
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 text-gray-400 hover:text-white"
												onClick={() => {
													setSelectedStudent(row.original);
													setshowStudentForm(true);
												}}
											>
												<Pencil className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length + 1}
										className="h-32 text-center text-gray-500"
									>
										No students found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Edit Modal */}
			<AnimatePresence>
				{showStudentForm && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 px-4 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center"
						onClick={() => setshowStudentForm(false)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.95, opacity: 0, y: 20 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-gray-900 border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl p-6"
						>
							<div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
								<div>
									<h2 className="text-xl font-bold text-white">Edit Student Records</h2>
									<p className="text-sm text-gray-400">Class {selectedClass}</p>
								</div>
								<Button variant="ghost" size="icon" onClick={() => setshowStudentForm(false)} className="text-gray-400 hover:text-white">
									<ChevronRightIcon className="h-4 w-4 rotate-45" /> {/* Close icon substitute */}
								</Button>
							</div>

							<form onSubmit={editStudentData} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label className="text-gray-400">Name</Label>
										<Input
											type="text"
											className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500"
											defaultValue={selectedStudent?.name}
											name="name"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-gray-400">Admission No.</Label>
										<Input
											type="number"
											className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500"
											name="admission_no"
											defaultValue={selectedStudent?.admission_number}
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-gray-400">Attendance</Label>
										<Input
											type="number"
											name="attendance"
											className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500"
											defaultValue={selectedStudent?.attendance}
										/>
									</div>
								</div>

								<div className="space-y-3">
									<Label className="text-indigo-400 font-semibold uppercase text-xs tracking-wider">Subject Marks</Label>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-950/30 p-4 rounded-lg border border-white/5">
										{subjects.map((subject) => (
											<div key={subject} className="space-y-1">
												<Label className="text-gray-500 text-xs uppercase">{subject}</Label>
												<Input
													name={subject}
													type="number"
													className="bg-gray-800/50 border-gray-700 text-white h-9 focus:border-teal-500 text-center font-mono"
													defaultValue={selectedStudent?.[subject as keyof Student]}
												/>
											</div>
										))}
									</div>
								</div>

								<div className="flex justify-end gap-3 pt-4 border-t border-white/10">
									<Button
										variant="ghost"
										type="button"
										className="text-gray-400 hover:text-white"
										onClick={() => setshowStudentForm(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="bg-indigo-600 hover:bg-indigo-500 text-white px-8"
									>
										Save Changes
									</Button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
