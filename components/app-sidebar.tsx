"use client";
import { GraduationCap, HomeIcon, LogOut } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { logout } from "@/utils/actions";
import Link from "next/link";

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
		title: "Class-1",
		url: `/admin/${ids["class-1"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-2",
		url: `/admin/${ids["class-2"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-3",
		url: `/admin/${ids["class-3"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-4",
		url: `/admin/${ids["class-4"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-6",
		url: `/admin/${ids["class-6"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-8",
		url: `/admin/${ids["class-8"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-9",
		url: `/admin/${ids["class-9"]}`,
		icon: GraduationCap,
	},
	{
		title: "Class-11",
		url: `/admin/${ids["class-11"]}`,
		icon: GraduationCap,
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	async function signOut() {
		try {
			await logout();
			window.location.href = "/";
		} catch (error) {
			throw new Error(`Some error occured, logout again : ${error}`);
		}
	}

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Subululhuda</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem key="home">
								<SidebarMenuButton
									asChild
									isActive={pathname === "/admin"}
									tooltip="Home"
								>
									<Link href="/admin">
										<HomeIcon />
										<span>Home</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Classes</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.url}
										tooltip={item.title}
									>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem key="logout">
						<SidebarMenuButton tooltip="Logout" onClick={signOut}>
							<LogOut />
							<span>Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
