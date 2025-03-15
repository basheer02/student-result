"use server";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { classSubjects, malayalamText, studentCount } from "@/utils/class-datas";

export default async function Page() {

  function translate(subject: string): string {
    return malayalamText[subject] || subject;
  }

  const data = [
			{
				title: "class-1",
				subjects: classSubjects[1]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[1],
			},
			{
				title: "class-2",
				subjects: classSubjects[2]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[2],
			},
			{
				title: "class-3",
				subjects: classSubjects[3]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[3],
			},
			{
				title: "class-4",
				subjects: classSubjects[4]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[4],
			},
			{
				title: "class-6",
				subjects: classSubjects[6]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[6],
			},
			{
				title: "class-8",
				subjects: classSubjects[8]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[8],
			},
			{
				title: "class-9",
				subjects: classSubjects[9]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[9],
			},
			{
				title: "class-11",
				subjects: classSubjects[11]
					.map((subject) => translate(subject))
					.join(", "),
				studentCount: studentCount[11],
			},
		];

	const headers = ["Class", "Subjects", "Students"];

	return (
		<div className="m-4 flex bg-white border shadow-md max-h-[calc(100vh-200px)]">
			<Table className="overflow-auto">
				<TableHeader>
					<TableRow>
						{headers.map((header) => (
							<TableHead
								key={header}
								className="sticky top-0 p-2 text-center font-bold uppercase tracking-wider bg-gray-300 border border-gray-400"
							>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((row) => (
						<TableRow key={row.title}>
							<TableCell className="cursor-pointer font-bold border border-gray-300 bg-gray-100 md:text-center text-start">
								<a href={`/admin/${row.title}`}>{row.title}</a>
							</TableCell>
							<TableCell className="font-bold border border-gray-300 bg-gray-100 md:text-center text-start">
								{row.subjects}
							</TableCell>
							<TableCell className="font-bold border border-gray-300 bg-gray-100 text-center">
								{row.studentCount}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
