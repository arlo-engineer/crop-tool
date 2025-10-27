import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AdBanner from "./components/AdBanner";
import Footer from "./components/Footer";
import "./globals.css";
import { TEXTS } from "@/lib/constants/text";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
	title: `${TEXTS.APP_NAME} - ${TEXTS.APP_DESCRIPTION}`,
	description: TEXTS.APP_DESCRIPTION,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={`${inter.variable} antialiased bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark flex flex-col min-h-screen`}
			>
				{children}
				<Footer />
				<AdBanner />
			</body>
		</html>
	);
}
