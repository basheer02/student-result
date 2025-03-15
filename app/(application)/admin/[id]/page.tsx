"use server";
import type { Student } from "@/types";
import { getClassData } from "@/utils/actions";
import { classSubjects } from "@/utils/class-datas";
import type { ColumnDef } from "@tanstack/react-table";
import TableContent from "./table-content";

export default async function Page({
	params,
}: { params: Promise<{ id: string }> }) {
	const parameters = await params;
	const clas = parameters.id;

	try {
		const classData = (await getClassData(clas)) as Student[];

		const selectedClass = clas.length === 7 ? clas.slice(-1) : clas.slice(-2);

		const subjects = classSubjects[Number(selectedClass)];

		const staticColumns: ColumnDef<Student>[] = [
			{
				accessorKey: "sl_no",
				header: "No.",
			},
			{
				accessorKey: "admission_number",
				header: "Adm No.",
			},
			{
				accessorKey: "name",
				header: "Name",
			},
			{
				accessorKey: "attendance",
				header: "Attendance",
			},
		];

		const dynamicColumns: ColumnDef<Student>[] = subjects.map((subject) => ({
			accessorKey: subject,
			header: subject,
		}));

		const totalMarkColumn: ColumnDef<Student>[] = [
			{
				accessorKey: "total_mark",
				header: "Total Mark",
			},
			{
				accessorKey: "status",
				header: "Status",
			},
			{
				accessorKey: "rank",
				header: "Rank",
			},
		];

		const columns = [...staticColumns, ...dynamicColumns, ...totalMarkColumn];

		return (
			<main>
				<TableContent
					classData={classData}
					columns={columns}
					selectedClass={selectedClass}
				/>
			</main>
		);
	} catch (error) {
		return (
			<main className="w-full h-screen items-center justify-center">
				<p className="font-bold text-white text-xl">{`Network error...${error}, Please reload the page`}</p>
			</main>
		);
	}
}
