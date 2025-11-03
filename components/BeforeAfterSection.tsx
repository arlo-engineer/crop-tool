export default function BeforeAfterSection() {
	return (
		<section className="w-full py-16 md:py-24 flex justify-center px-4 sm:px-6 md:px-8">
			<div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
				<div className="w-full md:w-1/2 flex flex-col items-start text-left gap-4">
					<h2 className="text-3xl md:text-4xl font-black tracking-tighter text-text-primary-light dark:text-text-primary-dark">
						Before &amp; After
					</h2>
					<p className="text-base text-text-secondary-light dark:text-text-secondary-dark max-w-md">
						Our advanced AI processing enhances your images, bringing out
						detail, correcting colors, and improving overall quality. See the
						dramatic difference for yourself.
					</p>
				</div>
				<div className="w-full md:w-1/2 relative flex justify-center items-center">
					<div className="relative w-full aspect-[4/3] group cursor-pointer" style={{ maxWidth: '458px' }}>
						<div
							className="absolute top-0 left-0 w-3/5 aspect-square rounded-xl bg-cover bg-center shadow-soft transition-all duration-500 ease-in-out z-20 group-hover:scale-95 group-hover:opacity-80 group-hover:z-10"
							style={{ backgroundImage: 'url("/after-image.jpg")' }}
						>
							<div className="absolute -bottom-2 -left-2 px-2 py-1 bg-white backdrop-blur-sm rounded-md text-xs font-semibold text-gray-900">
								AFTER
							</div>
						</div>
					<div
						className="absolute bottom-0 right-0 w-4/5 aspect-[4/3] rounded-xl bg-cover bg-right bg-no-repeat shadow-xl transition-all duration-500 ease-in-out z-10 scale-95 opacity-80 group-hover:scale-100 group-hover:opacity-100 group-hover:z-20"
						style={{ backgroundImage: 'url("/before-image.jpg")' }}
					>
							<div className="absolute -top-2 -right-2 px-2 py-1 bg-white backdrop-blur-sm rounded-md text-xs font-semibold text-gray-900">
								BEFORE
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
