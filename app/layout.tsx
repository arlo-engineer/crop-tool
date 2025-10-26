import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
	title: "ImageProcessor - 画像処理サービス",
	description: "画像トリミング・リサイズサービス",
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
				className={`${inter.variable} antialiased bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark`}
			>
				{children}
			</body>
		</html>
	);
}
