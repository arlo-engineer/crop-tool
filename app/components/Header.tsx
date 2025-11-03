import { TEXTS } from "@/lib/constants/text";
import Image from "next/image";

export default function Header() {
	return (
		<header className="w-full max-w-5xl mx-auto pt-4 sm:pt-6 md:pt-8">
			<div className="flex justify-between items-center h-14">
				<div className="flex items-center gap-2">
					<Image src="/logo.svg" alt="Logo" width={24} height={24} />
					<span className="text-xl font-bold text-text-primary">
						{TEXTS.APP_NAME}
					</span>
				</div>
				<nav className="flex items-center gap-6">
					<button
						type="button"
						className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
					>
						{TEXTS.NAV_QA}
					</button>
					<button
						type="button"
						className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
					>
						{TEXTS.NAV_HELP}
					</button>
				</nav>
			</div>
		</header>
	);
}
