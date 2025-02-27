"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminLogin, studentLogin } from "@/utils/actions";
import { ChevronRightIcon, User, UserCog } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

//import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

import MadrasaImage from "../public/madrasa.jpeg";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function LandingPage() {
	const [showStudent, setShowStudent] = useState(true);
	const [showAdmin, setShowAdmin] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const handleOpenModal = () => setIsModalOpen(true);

	const [currentRole, setCurrentRole] = useState("Student");
	const [showList, setShowList] = useState(false);
	//const [isOnline, setIsOnline] = useState(navigator.onLine);
	const roles = currentRole === "Student" ? "Admin" : "Student";

	//const isMobile = window.matchMedia("(max-width: 768px)").matches;
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Check window only after component mounts
		setIsMobile(window.matchMedia("(max-width: 768px)").matches);
	}, []);

	const [selectedClass, setSelectedClass] = useState("");

	const handleToggle = () => {
		setShowStudent(!showStudent);
		setShowAdmin(!showAdmin);
	};

	const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const toastId = toast.loading("Verifying...");

		const formData = new FormData(e.currentTarget);
		try {
			await adminLogin(formData);
			toast.success("Successful!", { id: toastId, duration:2000 });
		} catch (error) {
			if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
				toast.success("Successful!", { id: toastId, duration: 2000 });
			} else {
				toast.error("Verification failed!", { id: toastId, duration: 2000 });
			}
		}
	};

	const handleStudentLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const toastId = toast.loading("Verifying...");

		const formData = new FormData(e.currentTarget);
		const admNumber = formData.get("admission-number") as string;

		try {
			await studentLogin(selectedClass, admNumber);
			toast.success("Successful!", { id: toastId, duration: 2000 });
		} catch (error) {
			if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
				toast.success("Successful!", { id: toastId, duration: 2000 });
			} else {
				toast.error("Invalid admission number", { id: toastId, duration: 2000 });
			}
		}
	};

	// const download = async() => {
	// 	const documents = await getAlldata();
	// 	const worksheet = XLSX.utils.json_to_sheet(documents);
	// 	const workbook = XLSX.utils.book_new();
	// 	XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

	// 	// Generate and trigger the file download
	// 	const excelBuffer = XLSX.write(workbook, {
	// 		bookType: "xlsx",
	// 		type: "array",
	// 	});
	// 	const excelBlob = new Blob([excelBuffer], {
	// 		type: "application/octet-stream",
	// 	});

	// 	saveAs(excelBlob, "students.xlsx");
	// };

	const LoginForm = () => {
		return (
			<div className="p-4 rounded-md mt-2">
				<form
					className="w-full md:p-6"
					onSubmit={showAdmin ? handleAdminLogin : handleStudentLogin}
				>
					<h2 className="text-2xl text-white font-bold text-center">
						{showAdmin ? "Admin Login" : "Student Result"}
					</h2>
					{showStudent && (
						<Select
							value={selectedClass}
							onValueChange={(value) => setSelectedClass(value)}
						>
							<SelectTrigger className="mt-10 bg-gray-200 text-gray-900 p-4">
								<SelectValue placeholder="Select your class" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="class-1">Class-1</SelectItem>
									<SelectItem value="class-2">Class-2</SelectItem>
									<SelectItem value="class-3">Class-3</SelectItem>
									<SelectItem value="class-4">Class-4</SelectItem>
									<SelectItem value="class-5">Class-5</SelectItem>
									<SelectItem value="class-6">Class-6</SelectItem>
									<SelectItem value="class-7">Class-7</SelectItem>
									<SelectItem value="class-8">Class-8</SelectItem>
									<SelectItem value="class-9">Class-9</SelectItem>
									<SelectItem value="class-10">Class-10</SelectItem>
									<SelectItem value="class-11">Class-11</SelectItem>
									<SelectItem value="class-12">Class-12</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					)}
					<div className="mt-4 text-gray-400 py-3">
						<Label htmlFor="username">
							{showAdmin ? "Username" : "Admission number"}
						</Label>
						<Input
							className="p-4 rounded-lg bg-gray-200 mt-2 focus:border-blue-500 text-gray-900 focus:outline-none"
							type={showAdmin ? "text" : "number"}
							required
							id={showAdmin ? "username" : "admission-number"}
							name={showAdmin ? "username" : "admission-number"}
							placeholder={
								showAdmin ? "Enter username" : "Enter admission number"
							}
						/>
					</div>
					{showAdmin && (
						<div className="mt-2 text-gray-400 py-3">
							<Label htmlFor="password">Password</Label>
							<Input
								className="p-4 rounded-lg bg-gray-200 mt-2 focus:border-blue-500 text-gray-900 focus:outline-none"
								type="password"
								required
								id="password"
								name="password"
								placeholder="Enter your password"
							/>
						</div>
					)}
					<div className="py-4">
						<Button 
							className="w-full mt-3 text-white bg-teal-600 font-semibold hover:bg-teal-600/40"
							type="submit"
						>
							{showAdmin ? "Login" : "Check Result"}
						</Button>
					</div>
				</form>
			</div>
		);
	};

	return (
		<main>
			<div className="flex flex-col w-screen h-screen mx-auto shadow-md bg-gray-900 p-2 relative">
				<div className="flex flex-col p-1 absolute md:top-4 md:right-4 bottom-4 left-4 md:bottom-auto md:left-auto bg-gray-900 items-center cursor-pointer rounded-lg">
					<Button
						className="bg-gray-900"
						onClick={() => {
							setShowList(!showList);
						}}
					>
						<ChevronRightIcon
							className={`mr-2 transition-transform duration-300 ${showList ? "md:rotate-90 -rotate-90" : "rotate-0"}`}
							size={20}
						/>
						<span className="mr-2 font-bold">{currentRole}</span>
						{currentRole === "Student" ? (
							<User size={20} className="text-gray-100" />
						) : (
							<UserCog size={20} className="text-gray-100" />
						)}
					</Button>
					{showList && (
						<div className="absolute left-0 bg-gray-900 rounded-lg w-full md:top-full bottom-full md:bottom-auto">
							<Button
								className="bg-gray-900"
								onClick={() => {
									setShowList(!showList);
									setCurrentRole(roles);
									handleToggle();
								}}
							>
								<span className="ml-8">{roles}</span>
								{roles === "Student" ? (
									<User size={20} className="text-gray-100" />
								) : (
									<UserCog size={20} className="text-gray-100" />
								)}
							</Button>
						</div>
					)}
				</div>
				<h3 className="p-2 mt-2 text-2xl text-white font-bold text-center">
					SUBULULHUDA HIGHER SECONDARY MADRASA
				</h3>
				<div className="relative mt-4 rounded lg:flex">
					<Image
						src={MadrasaImage}
						alt="loading"
						className="mt-2 object-cover h-[400px] lg:ml-4 lg:h-[600px] lg:w-[900px] rounded-lg"
					/>
					<div className="p-3">
						<Button
							variant="secondary"
							className="mt-2 w-full lg:hidden"
							onClick={handleOpenModal}
						>
							{(showStudent && "Check result") || (showAdmin && "Login")}
						</Button>
					</div>
					{!isMobile && (
						<div className="m-6 p-6 border-t w-[500px] rounded-lg md:h-[450px]">
							{showStudent && <LoginForm />}
							{showAdmin && <LoginForm />}
						</div>
					)}
				</div>
				{isModalOpen && (
					<div className="fixed inset-0 px-4 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center">
						<div className="flex items-center justify-center h-full w-full">
							<div className="max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-10 shadow-xl shadow-gray-500/50">
								{showStudent && <LoginForm />}
								{showAdmin && <LoginForm />}
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
