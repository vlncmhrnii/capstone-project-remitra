import { ChevronRightIcon } from "@heroicons/react/24/outline";

function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}

function Breadcrumbs({
	className = "",
	items = [],
	separator,
	onItemClick,
}) {
	return (
		<nav
			aria-label="Breadcrumb"
			className={cn("w-full overflow-x-auto", className)}
		>
			<ol className="flex min-w-max items-center gap-1">
				{items.map((item, index) => {
					const key = item.key ?? `${item.label}-${index}`;
					const isCurrent =
						item.current ?? (index === items.length - 1 && !item.href);
					const isHome = index === 0;
					const content = (
						<>
							{item.icon ? (
								<span
									className={cn(
										"shrink-0",
										isHome ? "text-orange-600 dark:text-orange-300" : "text-neutral-500 dark:text-neutral-400",
									)}
								>
									{item.icon}
								</span>
							) : null}
							<span className={cn(isHome && "font-semibold")}>{item.label}</span>
						</>
					);

					return (
						<li key={key} className="flex items-center gap-1">
							{isCurrent ? (
								<span
									aria-current="page"
									className={cn(
										"inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-sm text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
										isHome && "font-semibold",
									)}
								>
									{content}
								</span>
							) : (
								<a
									href={item.href ?? "#"}
									onClick={(event) => {
										item.onClick?.(event, item);
										onItemClick?.(event, item, index);
									}}
									className={cn(
										"inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-neutral-600 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-orange-300",
										isHome && "font-semibold text-orange-600 dark:text-orange-300",
									)}
								>
									{content}
								</a>
							)}

							{index < items.length - 1 ? (
								<span className="text-neutral-400 dark:text-neutral-500" aria-hidden="true">
									{separator ?? <ChevronRightIcon className="h-4 w-4" />}
								</span>
							) : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

export default Breadcrumbs;
