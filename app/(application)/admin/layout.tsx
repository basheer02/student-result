import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
	children,
}: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

	const isAdmin = cookieStore.get("admin_auth")?.value === "true";

	if (!isAdmin) {
		redirect("/");
	}

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<main className="w-[100vw] h-[100vh]">
				<SidebarTrigger className="mt-2 p-2 text-white h-8 w-8 rounded-md hover:bg-gray-700/50 hover:text-white" />
				<h3 className="p-2 text-white text-center arabic-text">
					مدرسة سبل اله‍دى الثانوية العليا
				</h3>
				<h3 className="text-2xl text-white font-bold text-center p-1">
					SUBULULHUDA HIGHER SECONDARY MADRASA
				</h3>
				{children}
			</main>
		</SidebarProvider>
	);
}
