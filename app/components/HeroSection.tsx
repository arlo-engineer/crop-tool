import { TEXTS } from "@/lib/constants/text";

export default function HeroSection() {
	return (
		<section className="w-full max-w-5xl flex flex-col items-center text-center mb-6">
			{/* Badge */}
			<span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-primary/20 dark:text-primary mb-2">
				{TEXTS.HERO_BADGE}
			</span>

			{/* Main Heading */}
			<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark leading-snug max-w-3xl mx-auto mb-2">
				{TEXTS.HERO_TITLE}
			</h1>

			{/* Subtitle */}
			<p className="text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto mb-6">
				{TEXTS.HERO_SUBTITLE}
			</p>
		</section>
	);
}
