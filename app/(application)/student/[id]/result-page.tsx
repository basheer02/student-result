"use client";
import { Download, CheckCircle2, XCircle, ArrowLeft, GraduationCap, School } from "lucide-react";
import Image from "next/image";
import jsPDF from "jspdf";
import type { Student } from "@/types";
import { Button } from "@/components/ui/button";
import autoTable from "jspdf-autotable";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { classSubjects, malayalamText, subjectText } from "@/utils/class-datas";
import { motion } from "framer-motion";

export default function ResultPage({ studentData }: { studentData: Student }) {
	const subjects = classSubjects[Number(studentData.class)];
	const schoolName = "SUBULULHUDA HIGHER SECONDARY MADRASA";

	const showConfetti = studentData.status === "passed";
	const [opacity, setOpacity] = useState(1);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (typeof window !== "undefined") {
			setDimensions({ width: window.innerWidth, height: window.innerHeight });
		}
		setTimeout(() => setOpacity(0), 4000); // Slowly fade out after 4s
	}, []);

	const generatePDF = () => {
		const toastId = toast.loading("Downloading mark list...");
		const doc = new jsPDF();

		//Set school name at the top
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
			["Name", studentData.name],
		];

		// Calculate total width of the table
		const pageWidth = doc.internal.pageSize.getWidth();
		const marginLeft = (pageWidth - 140) / 2;

		autoTable(doc, {
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

		let startY = 85;

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
		} else if (subjects.length === 8) {
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
		toast.success("Download successful!", { id: toastId, duration: 2000 });
	};

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center p-4 lg:p-8 bg-black/20">
			{showConfetti && (
				<div style={{ opacity, transition: "opacity 2s ease-out" }} className="fixed inset-0 pointer-events-none z-50">
					<Confetti width={dimensions.width} height={dimensions.height} />
				</div>
			)}

			<div className="w-full max-w-4xl mx-auto">
				{/* Top Actions */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-between items-center mb-6"
				>
					<Button
						variant="ghost"
						onClick={() => redirect("/")}
						className="text-gray-400 hover:text-white hover:bg-white/10"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Search
					</Button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="glass-panel overflow-hidden relative"
				>
					{/* Decorative background elements */}
					<div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
					<div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

					{/* Header Section */}
					<div className="relative p-4 md:p-8 text-center border-b border-white/10 bg-white/5">
						<div className="flex justify-center mb-4">
							<div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.3)] relative shrink-0">
								<Image src="/madrasa-logo.jpeg" alt="Madrasa Logo" fill className="object-contain scale-[1.4]" />
							</div>
						</div>
						<h1 className="text-3xl lg:text-4xl text-white font-bold mb-2 arabic-text">
							مدرسة سبل اله‍دى الثانوية العليا
						</h1>
						<h2 className="text-xl lg:text-2xl text-gray-200 font-bold tracking-wide">
							SUBULULHUDA HIGHER SECONDARY MADRASA
						</h2>
						<p className="text-gray-400 mt-2 font-medium">CHENAKKALANGADI, MALAPPURAM</p>
						<div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold uppercase tracking-wider">
							Annual Examination Result 2025-26
						</div>
					</div>

					{/* Student Details Grid */}
					<div className="p-4 md:p-8 pb-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<div className="glass p-4 rounded-xl border-l-4 border-l-teal-500">
								<p className="text-xs text-gray-400 mb-1">Student Name</p>
								<p className="text-lg font-bold text-white uppercase break-words leading-tight">{studentData.name}</p>
							</div>
							<div className="glass p-4 rounded-xl border-l-4 border-l-indigo-500">
								<p className="text-xs text-gray-400 mb-1">Admission No</p>
								<p className="text-lg font-bold text-white font-mono">{studentData.admission_number}</p>
							</div>
							<div className="glass p-4 rounded-xl border-l-4 border-l-purple-500">
								<p className="text-xs text-gray-400 mb-1">Class</p>
								<p className="text-lg font-bold text-white">Class {studentData.class}</p>
							</div>
							<div className="glass p-4 rounded-xl border-l-4 border-l-pink-500">
								<p className="text-xs text-gray-400 mb-1">Attendance</p>
								<p className="text-lg font-bold text-white">{((Number(studentData.attendance) / 230) * 100).toFixed(0)}%</p>
							</div>
						</div>

						{/* Marks List */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
							{subjects.map((subject, index) => {
								const mark = studentData[subject as keyof Student];
								// Determine if failed (mark < 18 or specific strings)
								const isFail =
									Number(mark) < 18 ||
									["absent", "a", "fail", "failed"].includes(String(mark).toLowerCase());

								return (
									<motion.div
										key={subject}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 + 0.2 }}
										className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
									>
										<div className="flex items-center gap-3">
											<div className={`w-2 h-2 rounded-full ${isFail ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"}`}></div>
											<span className="font-medium text-gray-200 text-sm md:text-base">
												{malayalamText[subject]}
											</span>
										</div>
										<div className={`font-mono font-bold px-3 py-1 rounded-lg text-sm md:text-base border backdrop-blur-sm ${isFail
											? "bg-red-500/10 text-red-300 border-red-500/20"
											: "bg-teal-500/10 text-teal-300 border-teal-500/20"
											}`}>
											{mark}
										</div>
									</motion.div>
								);
							})}
						</div>

						{/* Result Footer */}
						<div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
							<div className="flex flex-col items-center md:items-start space-y-1">
								<span className="text-sm text-gray-400 uppercase tracking-widest">Total Marks</span>
								<span className="text-4xl font-black text-white">{studentData.total_mark}</span>
							</div>

							<div className="flex flex-col items-center">
								<div className={`flex items-center space-x-2 px-6 py-2 rounded-full border ${studentData.status === "passed"
									? "bg-green-500/20 border-green-500/30 text-green-300"
									: "bg-red-500/20 border-red-500/30 text-red-300"
									}`}>
									{studentData.status === "passed" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
									<span className="text-xl font-bold uppercase">{studentData.status}</span>
								</div>
							</div>

							{studentData.status === "passed" && (
								<div className="flex flex-col items-center md:items-end space-y-1">
									<span className="text-sm text-gray-400 uppercase tracking-widest">Rank</span>
									<span className="text-2xl md:text-4xl font-black text-yellow-500 drop-shadow-sm flex items-center">
										#{studentData.rank}
										<GraduationCap className="ml-2 opacity-50" size={20} />
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Action Button */}
					<div className="p-6 bg-gray-900/30 border-t border-white/10 flex justify-center">
						<Button
							variant="default"
							size="lg"
							className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-teal-900/40 transform transition hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/50"
							onClick={generatePDF}
						>
							<Download className="mr-2 h-5 w-5" />
							Download Official Mark List
						</Button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
