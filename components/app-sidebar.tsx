"use client";
import { GraduationCap, HomeIcon, LogOut, ChartBar } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/utils/actions";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";

const ids = {
	"class-1": "class-1",
	"class-2": "class-2",
	"class-3": "class-3",
	"class-4": "class-4",
	"class-6": "class-6",
	"class-8": "class-8",
	"class-9": "class-9",
	"class-11": "class-11",
};

// Menu items.
const items = [
	{
		title: "Class 1",
		url: `/admin/${ids["class-1"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 2",
		url: `/admin/${ids["class-2"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 3",
		url: `/admin/${ids["class-3"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 4",
		url: `/admin/${ids["class-4"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 6",
		url: `/admin/${ids["class-6"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 8",
		url: `/admin/${ids["class-8"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 9",
		url: `/admin/${ids["class-9"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class 11",
		url: `/admin/${ids["class-11"]}`,
		icon: GraduationCap,
	},
];

export function AppSidebar() {
	const pathname = usePathname();
	const { setOpenMobile } = useSidebar();

	async function signOut() {
		const toastId = toast.loading("Signing out...");
		try {
			await logout();
			toast.success("Signed out successfully", { id: toastId });
			window.location.href = "/";
		} catch (error) {
			toast.error("Error signing out", { id: toastId });
			throw new Error(`Some error occured, logout again : ${error}`);
		}
	}

	return (
		<Sidebar
			variant="floating"
			collapsible="icon"
			className="border-r border-white/10 bg-gray-950/80 backdrop-blur-xl"
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild className="hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white">
							<Link href="/admin" onClick={() => setOpenMobile(false)}>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
									<ChartBar className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
									<span className="truncate font-bold text-white">Subululhuda</span>
									<span className="truncate text-xs text-gray-400">Admin Dashboard</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="p-2">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={pathname === "/admin"}
									tooltip="Dashboard Overview"
									className={`
										hover:bg-white/10 hover:text-white transition-all duration-200
										${pathname === "/admin"
											? "bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/20"
											: "text-gray-400"
										}
									`}
								>
									<Link
										href="/admin"
										className="flex items-center gap-3 p-2 font-medium"
										onClick={() => setOpenMobile(false)}
									>
										<HomeIcon className={pathname === "/admin" ? "text-teal-400" : ""} />
										<span>Dashboard</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className="bg-white/5 my-2" />

				<SidebarGroup>
					<SidebarGroupLabel className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2 mb-2 group-data-[collapsible=icon]:hidden">
						Class Management
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							{items.map((item) => {
								const isActive = pathname === item.url;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
											className={`
												relative overflow-hidden transition-all duration-300
												hover:bg-white/10 hover:text-white
												${isActive
													? "bg-indigo-500/10 text-indigo-300 font-semibold ring-1 ring-indigo-500/20"
													: "text-gray-400"
												}
											`}
										>
											<Link
												href={item.url}
												className="flex items-center gap-3 p-2"
												onClick={() => setOpenMobile(false)}
											>
												{isActive && (
													<motion.div
														layoutId="active-sidebar"
														className="absolute left-0 w-1 h-full bg-indigo-500 rounded-r-full"
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ duration: 0.2 }}
													/>
												)}
												<item.icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-gray-500"}`} />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-4 border-t border-white/5">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={signOut}
							className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full justify-start gap-3 p-2 rounded-md ring-1 ring-red-500/10 group-data-[collapsible=icon]:justify-center"
							tooltip="Sign Out"
						>
							<LogOut className="h-4 w-4" />
							<span className="font-medium group-data-[collapsible=icon]:hidden">Sign Out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
