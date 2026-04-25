"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

type BaseFieldProps = {
	label: string;
	helperText?: string;
	required?: boolean;
};

type ModalDateFieldProps = BaseFieldProps & {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	min?: string;
	max?: string;
};

export function ModalDateField({
	label,
	helperText,
	required = false,
	value,
	onChange,
	placeholder,
	disabled = false,
	min,
	max,
}: ModalDateFieldProps) {
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const openDatePicker = () => {
		const input = inputRef.current;
		if (!input || disabled) return;

		if (typeof input.showPicker === "function") {
			try {
				input.showPicker();
			} catch {
				input.focus();
			}
			return;
		}

		input.focus();
	};

	return (
		<div className="space-y-1">
			<label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
				{label}
				{required ? <span className="ml-1 text-orange-500">*</span> : null}
			</label>

			<div className="group relative">
				<input
					ref={inputRef}
					type="date"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					onMouseDown={openDatePicker}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder={placeholder}
					disabled={disabled}
					min={min}
					max={max}
					className="scheme-light block min-w-0 w-full appearance-none rounded-full border-2 border-neutral-300 bg-white px-4 py-3 pr-12 text-[14px] leading-5 font-normal text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 dark:scheme-dark dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-orange-400 dark:focus:ring-orange-500/15 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none"
				/>
				<button
					type="button"
					onClick={openDatePicker}
					className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition hover:text-orange-500 dark:text-zinc-500 dark:hover:text-orange-400"
					aria-label={`Buka kalender ${label}`}
				>
					<CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
				</button>
			</div>

			{isFocused && helperText ? <p className="text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p> : null}
		</div>
	);
}

type ModalSelectFieldProps = BaseFieldProps & {
	value: string;
	onChange: (value: string) => void;
	options: Array<{ label: string; value: string }>;
	disabled?: boolean;
};

export function ModalSelectField({
	label,
	helperText,
	required = false,
	value,
	onChange,
	options,
	disabled = false,
}: ModalSelectFieldProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!containerRef.current?.contains(target)) {
				setIsOpen(false);
				setIsFocused(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [isOpen]);

	const selectedOption = options.find((option) => option.value === value) ?? options[0];

	return (
		<div className="space-y-1" ref={containerRef}>
			<label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
				{label}
				{required ? <span className="ml-1 text-orange-500">*</span> : null}
			</label>

			<div className="group relative">
				<button
					type="button"
					disabled={disabled}
					onClick={() => {
						if (disabled) return;
						setIsOpen((current) => !current);
						setIsFocused(true);
					}}
					onFocus={() => setIsFocused(true)}
					onBlur={() => {
						if (!isOpen) setIsFocused(false);
					}}
					className="w-full rounded-full border-2 border-neutral-300 bg-white px-4 py-3 pr-12 text-left text-[14px] leading-5 font-normal text-neutral-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-orange-400 dark:focus:ring-orange-500/15 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
				>
					{selectedOption?.label ?? "Pilih opsi"}
				</button>
				<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition group-focus-within:text-orange-500 dark:text-zinc-500 dark:group-focus-within:text-orange-400">
					<ChevronDownIcon className={`h-4 w-4 transition ${isOpen ? "rotate-180" : "rotate-0"}`} aria-hidden="true" />
				</div>

				{isOpen ? (
					<div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
						{options.map((option) => {
							const isSelected = option.value === value;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										onChange(option.value);
										setIsOpen(false);
										setIsFocused(false);
									}}
									className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
										isSelected
											? "bg-orange-500 text-white"
											: "text-neutral-700 hover:bg-neutral-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
									}`}
								>
									{option.label}
								</button>
							);
						})}
					</div>
				) : null}
			</div>

			{(isFocused || isOpen) && helperText ? <p className="text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p> : null}
		</div>
	);
}
