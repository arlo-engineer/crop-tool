"use client";

import { TEXTS } from "@/lib/constants/text";
import { useState } from "react";

export default function Footer() {
	const [selectedLanguage, setSelectedLanguage] = useState("ja");

	return (
		<footer className="w-full bg-gray-50 border-t border-gray-200 py-10 px-5 mt-auto">
			<div className="max-w-7xl mx-auto flex flex-col items-center">
				<div className="text-base font-bold text-gray-800 mb-5">
					{TEXTS.APP_NAME}
				</div>
				<nav className="flex flex-col sm:flex-row items-center justify-center gap-y-4 gap-x-6 mb-6">
					<a
						className="text-sm text-gray-500 hover:underline cursor-pointer"
						href="#"
					>
						{TEXTS.FOOTER_NAV_TERMS}
					</a>
					<span className="hidden sm:inline text-gray-400">|</span>
					<a
						className="text-sm text-gray-500 hover:underline cursor-pointer"
						href="#"
					>
						{TEXTS.FOOTER_NAV_PRIVACY}
					</a>
					<span className="hidden sm:inline text-gray-400">|</span>
					<a
						className="text-sm text-gray-500 hover:underline cursor-pointer"
						href="#"
					>
						{TEXTS.FOOTER_NAV_CONTACT}
					</a>
				</nav>
				<div className="relative mb-5">
					<select
						value={selectedLanguage}
						onChange={(e) => setSelectedLanguage(e.target.value)}
						className="pl-8 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-[6px] shadow-sm focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
					>
						<option value="ja">{TEXTS.FOOTER_LANGUAGE_JP}</option>
						<option value="en">{TEXTS.FOOTER_LANGUAGE_EN}</option>
					</select>
					<span className="absolute left-2 top-1/2 -translate-y-1/2 text-base pointer-events-none">
						🌐
					</span>
				</div>
				<p className="text-xs text-gray-400">{TEXTS.FOOTER_COPYRIGHT}</p>
			</div>
		</footer>
	);
}
