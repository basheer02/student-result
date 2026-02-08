"use client";

import { classSubjects, malayalamText, studentCount } from "@/utils/class-datas";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, BookOpen, GraduationCap, ChevronRight } from "lucide-react";

export default function Page() {
	function translate(subject: string): string {
		return malayalamText[subject] || subject;
	}

	const data = [
		{
			title: "class-1",
			id: 1,
			studentCount: studentCount[1],
			subjects: classSubjects[1],
			color: "from-blue-500/20 to-cyan-500/20",
			borderColor: "border-blue-500/30",
			iconColor: "text-blue-400"
		},
		{
			title: "class-2",
			id: 2,
			studentCount: studentCount[2],
			subjects: classSubjects[2],
			color: "from-purple-500/20 to-pink-500/20",
			borderColor: "border-purple-500/30",
			iconColor: "text-purple-400"
		},
		{
			title: "class-3",
			id: 3,
			studentCount: studentCount[3],
			subjects: classSubjects[3],
			color: "from-emerald-500/20 to-teal-500/20",
			borderColor: "border-emerald-500/30",
			iconColor: "text-emerald-400"
		},
		{
			title: "class-4",
			id: 4,
			studentCount: studentCount[4],
			subjects: classSubjects[4],
			color: "from-amber-500/20 to-orange-500/20",
			borderColor: "border-amber-500/30",
			iconColor: "text-amber-400"
		},
		{
			title: "class-6",
			id: 6,
			studentCount: studentCount[6],
			subjects: classSubjects[6],
			color: "from-red-500/20 to-rose-500/20",
			borderColor: "border-red-500/30",
			iconColor: "text-red-400"
		},
		{
			title: "class-8",
			id: 8,
			studentCount: studentCount[8],
			subjects: classSubjects[8],
			color: "from-indigo-500/20 to-violet-500/20",
			borderColor: "border-indigo-500/30",
			iconColor: "text-indigo-400"
		},
		{
			title: "class-9",
			id: 9,
			studentCount: studentCount[9],
			subjects: classSubjects[9],
			color: "from-lime-500/20 to-green-500/20",
			borderColor: "border-lime-500/30",
			iconColor: "text-lime-400"
		},
		{
			title: "class-11",
			id: 11,
			studentCount: studentCount[11],
			subjects: classSubjects[11],
			color: "from-fuchsia-500/20 to-magenta-500/20",
			borderColor: "border-fuchsia-500/30",
			iconColor: "text-fuchsia-400"
		},
	];

	return (
		<div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
				<p className="text-gray-400">Manage student records and performance across all classes.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{data.map((item, index) => (
					<Link href={`/admin/${item.title}`} key={item.title}>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							whileHover={{ scale: 1.02 }}
							className={`
								relative overflow-hidden rounded-xl border ${item.borderColor}
								bg-gradient-to-br ${item.color} backdrop-blur-sm
								p-6 h-full flex flex-col justify-between group
								shadow-lg hover:shadow-xl transition-all duration-300
							`}
						>
							<div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
								<ChevronRight className={`w-5 h-5 ${item.iconColor}`} />
							</div>

							<div>
								<div className="flex items-center gap-3 mb-4">
									<div className={`p-2 rounded-lg bg-black/20 ${item.iconColor}`}>
										<GraduationCap size={24} />
									</div>
									<h2 className="text-xl font-bold text-white capitalize">
										{item.title.replace('-', ' ')}
									</h2>
								</div>

								<div className="space-y-4">
									<div className="flex items-center text-gray-300 text-sm">
										<Users className="w-4 h-4 mr-2 opacity-70" />
										<span>{item.studentCount} Students Enrolled</span>
									</div>

									<div className="flex items-start text-gray-300 text-sm">
										<BookOpen className="w-4 h-4 mr-2 mt-1 opacity-70 flex-shrink-0" />
										<span className="line-clamp-2 leading-relaxed opacity-80">
											{item.subjects.map(s => translate(s)).join(", ")}
										</span>
									</div>
								</div>
							</div>

							<div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
								<span className={`text-xs font-semibold uppercase tracking-wider ${item.iconColor}`}>
									View Records
								</span>
								<div className="h-1 flex-1 mx-4 bg-white/10 rounded-full overflow-hidden">
									<div className={`h-full w-3/4 rounded-full bg-current opacity-50 ${item.iconColor}`} />
								</div>
							</div>
						</motion.div>
					</Link>
				))}
			</div>
		</div>
	);
}
