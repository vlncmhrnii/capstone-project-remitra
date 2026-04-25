"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase";
import { clearProfile, setProfile } from "@/lib/stores/auth-profile.store";

export default function AuthProfileSync() {
	useEffect(() => {
		const supabase = createClient();
		let isMounted = true;

		async function syncProfile() {
			const { data, error } = await supabase.auth.getUser();

			if (!isMounted) return;

			if (error || !data.user) {
				clearProfile();
				return;
			}

			setProfile(data.user);
		}

		void syncProfile();

		const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
			if (!isMounted) return;

			if (session?.user) {
				setProfile(session.user);
				return;
			}

			clearProfile();
		});

		return () => {
			isMounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	return null;
}
