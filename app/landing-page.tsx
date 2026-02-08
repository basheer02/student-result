"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminLogin, studentLogin } from "@/utils/actions";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import Img1 from "../public/1.jpeg";
import Img2 from "../public/2.jpeg";
import Img3 from "../public/3.jpeg";
import Img4 from "../public/4.jpeg";
import Img5 from "../public/5.jpeg";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, GraduationCap, ShieldCheck } from "lucide-react";

const Images = [Img1, Img2, Img3, Img4, Img5];

export default function LandingPage() {
	const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
	const [selectedClass, setSelectedClass] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Result publishing logic
	const [resultPublished, setResultPublished] = useState(true);

	useEffect(() => {
		const targetDateIST = new Date("2025-03-17T02:00:00Z");
		const now = new Date();
		setResultPublished(now >= targetDateIST);
	}, []);

	const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		const toastId = toast.loading("Verifying admin credentials...");

		const formData = new FormData(e.currentTarget);
		try {
			await adminLogin(formData);
			toast.success("Welcome back, Admin!", { id: toastId, duration: 2000 });
		} catch (error) {
			if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
				toast.success("Welcome back, Admin!", { id: toastId, duration: 2000 });
			} else {
				toast.error("Verification failed!", { id: toastId, duration: 2000 });
				setIsLoading(false);
			}
		}
	};

	const handleStudentLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!selectedClass) {
			toast.error("Please select a class first");
			return;
		}
		setIsLoading(true);
		const toastId = toast.loading("Searching for result...");

		const formData = new FormData(e.currentTarget);
		const admNumber = formData.get("admission-number") as string;

		try {
			await studentLogin(selectedClass, admNumber);
			toast.success("Result found!", { id: toastId, duration: 2000 });
		} catch (error) {
			if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
				toast.success("Result found!", { id: toastId, duration: 2000 });
			} else {
				toast.error("Invalid admission number or class", {
					id: toastId,
					duration: 2000,
				});
				setIsLoading(false);
			}
		}
	};

	return (
		<main className="min-h-screen flex items-center justify-center w-full max-w-full overflow-x-hidden bg-black/20">
			<div className="w-full max-w-7xl flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-16 items-center mx-auto px-4 sm:px-6 lg:px-8">
				{/* Left Side: Visuals & Info */}
				<motion.div
					initial={{ opacity: 0, x: -50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8 }}
					className="flex flex-col space-y-4 md:space-y-6 order-1 w-full items-center lg:items-start"
				>
					<div className="space-y-2 text-center lg:text-left w-full max-w-full px-0 sm:px-2">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="inline-flex items-center px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm font-medium mb-4"
						>
							<Sparkles size={14} className="mr-2" />
							Annual Examination Results 2025-26
						</motion.div>
						<h1 className="text-xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2 arabic-text break-words max-w-full leading-relaxed py-1">
							مدرسة سبل اله‍دى الثانوية العليا
						</h1>
						<h2 className="text-sm md:text-2xl lg:text-3xl font-bold text-gray-200 break-words max-w-full leading-normal">
							SUBULULHUDA HIGHER SECONDARY MADRASA
						</h2>
						<p className="text-xs md:text-lg text-gray-400 font-medium tracking-wide">
							CHENAKKALANGADI
						</p>
					</div>

					<div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video w-full max-w-lg mx-auto lg:mx-0 bg-black/50 mt-4 lg:mt-0">
						<Swiper
							modules={[Autoplay, EffectFade]}
							effect="fade"
							autoplay={{ delay: 3500, disableOnInteraction: false }}
							loop
							speed={1000}
							className="h-full w-full"
						>
							{Images.map((src, index) => (
								<SwiperSlide key={index}>
									<Image
										src={src}
										alt={`Slide ${index + 1}`}
										fill
										className="object-cover opacity-80"
										priority={index === 0}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</motion.div>

				{/* Right Side: Login Form */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="order-2 w-full max-w-md mx-auto"
				>
					<div className="glass-card p-1">
						<div className="bg-gray-900/40 backdrop-blur-xl rounded-xl p-3 md:p-6 lg:p-8 border border-white/5 shadow-inner">
							{/* Tab Switcher */}
							<div className="grid grid-cols-2 gap-2 p-1 bg-gray-950/50 rounded-lg mb-8">
								<button
									onClick={() => setActiveTab("student")}
									className={`relative flex items-center justify-center py-1.5 md:py-2.5 text-xs md:text-sm font-medium rounded-md transition-all duration-300 ${activeTab === "student"
										? "text-white"
										: "text-gray-400 hover:text-gray-200"
										}`}
								>
									{activeTab === "student" && (
										<motion.span
											layoutId="activeTab"
											className="absolute inset-0 bg-teal-600 rounded-md shadow-lg shadow-teal-900/20"
											transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
										/>
									)}
									<span className="relative z-10 flex items-center">
										<GraduationCap size={18} className="mr-2" />
										Student
									</span>
								</button>
								<button
									onClick={() => setActiveTab("admin")}
									className={`relative flex items-center justify-center py-1.5 md:py-2.5 text-xs md:text-sm font-medium rounded-md transition-all duration-300 ${activeTab === "admin"
										? "text-white"
										: "text-gray-400 hover:text-gray-200"
										}`}
								>
									{activeTab === "admin" && (
										<motion.span
											layoutId="activeTab"
											className="absolute inset-0 bg-indigo-600 rounded-md shadow-lg shadow-indigo-900/20"
											transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
										/>
									)}
									<span className="relative z-10 flex items-center">
										<ShieldCheck size={18} className="mr-2" />
										Admin
									</span>
								</button>
							</div>

							<div className="min-h-[320px]">
								<AnimatePresence mode="wait">
									{activeTab === "student" ? (
										<motion.form
											key="student-form"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.3 }}
											onSubmit={handleStudentLogin}
											className="space-y-5"
										>
											{!resultPublished ? (
												<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
													<p className="text-red-400 font-semibold mb-1">Results Not Published Yet</p>
													<p className="text-xs text-red-300/80">
														Publishing on March 17, 7:30 AM
													</p>
												</div>
											) : (
												<>
													<div className="text-center mb-6">
														<h3 className="text-xl md:text-2xl font-bold text-white mb-1">Check Result</h3>
														<p className="text-sm text-gray-400">
															Enter your details to view marks
														</p>
													</div>
													<div className="space-y-2">
														<Label className="text-gray-300">Class</Label>
														<Select
															value={selectedClass}
															onValueChange={setSelectedClass}
														>
															<SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-100 h-9 md:h-12 text-sm md:text-base">
																<SelectValue placeholder="Select Class" />
															</SelectTrigger>
															<SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
																<SelectGroup>
																	{["class-1", "class-2", "class-3", "class-4", "class-6", "class-8", "class-9", "class-11"].map((cls) => (
																		<SelectItem key={cls} value={cls} className="focus:bg-gray-800 focus:text-white cursor-pointer transition-colors duration-200">
																			{cls.replace("class-", "Class ")}
																		</SelectItem>
																	))}
																</SelectGroup>
															</SelectContent>
														</Select>
													</div>

													<div className="space-y-2">
														<Label htmlFor="admission-number" className="text-gray-300">
															Admission Number
														</Label>
														<Input
															id="admission-number"
															name="admission-number"
															type="number"
															placeholder="Ex: 1234"
															required
															className="bg-gray-800/50 border-gray-700 text-gray-100 h-9 md:h-12 text-sm md:text-base focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300"
														/>
													</div>

													<Button
														type="submit"
														disabled={isLoading}
														className="w-full h-9 md:h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-teal-900/20 transition-all duration-300 rounded-lg text-sm md:text-base"
													>
														{isLoading ? (
															<Loader2 className="animate-spin mr-2" />
														) : (
															"View Result"
														)}
													</Button>
												</>
											)}
										</motion.form>
									) : (
										<motion.form
											key="admin-form"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.3 }}
											onSubmit={handleAdminLogin}
											className="space-y-5"
										>
											<div className="text-center mb-6">
												<h3 className="text-2xl font-bold text-white mb-1">Admin Access</h3>
												<p className="text-sm text-gray-400">
													Secure login for faculty
												</p>
											</div>

											<div className="space-y-2">
												<Label htmlFor="username" className="text-gray-300">Username</Label>
												<Input
													id="username"
													name="username"
													type="text"
													required
													placeholder="Enter username"
													className="bg-gray-800/50 border-gray-700 text-gray-100 h-9 md:h-12 text-sm md:text-base focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="password" className="text-gray-300">Password</Label>
												<Input
													id="password"
													name="password"
													type="password"
													required
													placeholder="••••••••"
													className="bg-gray-800/50 border-gray-700 text-gray-100 h-9 md:h-12 text-sm md:text-base focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
												/>
											</div>

											<Button
												type="submit"
												disabled={isLoading}
												className="w-full h-9 md:h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all duration-300 rounded-lg text-sm md:text-base"
											>
												{isLoading ? (
													<Loader2 className="animate-spin mr-2" />
												) : (
													"Login to Dashboard"
												)}
											</Button>
										</motion.form>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</motion.div>
			</div >
		</main >
	);
}
