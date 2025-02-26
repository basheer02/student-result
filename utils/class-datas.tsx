

import type { Student } from "@/types";
import { db } from "./db";
import { setDoc, doc } from "firebase/firestore";

export const classSubjects: Record<number, string[]> = {
	1: ["writing", "reading"],
	2: ["quran", "hifl", "fiqh", "aqeeda", "lis_quran", "aqlaq"],
	3: [
		"quran",
		"hifl",
		"fiqh",
		"aqeeda",
		"lis_quran",
		"aqlaq",
		"tariq",
		"tajvid",
	],
	4: [
		"quran",
		"hifl",
		"fiqh",
		"aqeeda",
		"lis_quran",
		"aqlaq",
		"tariq",
		"tajvid",
	],
	5: [
		"quran",
		"hifl",
		"fiqh",
		"aqeeda",
		"lis_quran",
		"aqlaq",
		"tariq",
		"tajvid",
	],
	6: ["qur'an", "hifl", "fiqh", "tariq", "dur ihsan", "lis_quran"],
	7: ["qur'an", "hifl", "fiqh", "tariq", "dur ihsan", "lis_quran"],
	8: ["fiqh", "tariq", "dur_ihsan", "lis_quran"],
	9: ["fiqh", "tariq", "dur_ihsan", "lis_quran"],
	10: ["fiqh", "tafsir", "dur_ihsan", "lis_quran"],
	11: ["fiqh", "tafsir", "dur_ihsan", "lis_quran"],
	12: ["fiqh", "tafsir", "dur_ihsan", "lis_quran"],
};

export const malayalamText: Record<string, string> = {
	writing: "തഫ്ഹീമു തിലാവ (എഴുത്ത്)",
	reading: "തഫ്ഹീമു തിലാവ (വായന)",
	quran: "ഖുർആൻ",
	hifl: "ഹിഫ്ൾ",
	fiqh: "ഫിഖ്ഹ്",
	aqeeda: "അഖീദ",
	lis_quran: "ലിസാനുൽ ഖുർആൻ",
	aqlaq: "അഖ്ലാഖ്",
	tariq: "താരിഖ്",
	tajvid: "തജ് വീദ്",
	dur_ihsan: "ദുറുസുൽ ഇഹ്സാൻ",
	tafsir: "തഫ്സീർ",
};

export const subjectText: Record<string, string> = {
	writing: "Tafheemu Tilawa (Writing)",
	reading: "Tafheemu Tilawa (Reading)",
	quran: "Qur'an",
	hifl: "Hifl",
	fiqh: "Fiqh",
	aqeeda: "Aqeeda",
	lis_quran: "Lisanul Qur'an",
	aqlaq: "Aqlaq",
	tariq: "Tariq",
	tajvid: "Tajvid",
	dur_ihsan: "Durusul Ihsan",
	tafsir: "Tafsir",
};


export const studentCount: Record<number, number> = {
	1: 42,
	2: 52,
	3: 50,
	4: 47,
	5: 48,
	6: 49,
	7: 28,
	8: 32,
	9: 35,
	10: 33,
	11: 20,
	12: 11,
};
