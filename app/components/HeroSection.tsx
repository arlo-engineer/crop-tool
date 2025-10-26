import { TEXTS } from "@/lib/constants/text";

export default function HeroSection() {
	return (
		<section className="w-full max-w-5xl flex flex-col items-center text-center mb-8">
			{/* Badge */}
			<span className="inline-block rounded-full bg-primary text-white px-4 py-1 text-xs sm:text-sm font-medium mb-4">
				{TEXTS.HERO_BADGE}
			</span>

			{/* Main Heading */}
			<h1 className="text-2xl md:text-4xl font-bold leading-[1.4] text-center max-w-3xl mx-auto mb-4 text-text-primary-light dark:text-text-primary-dark">
				{TEXTS.HERO_TITLE}
			</h1>

			{/* Subtitle */}
			<p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark text-center max-w-2xl mx-auto mb-10">
				{TEXTS.HERO_SUBTITLE}
			</p>
		</section>
	);
}
