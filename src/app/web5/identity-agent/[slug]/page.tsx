"use client";

import { BasePage } from "@/app/shared/BasePage";
import { Web5Provider } from "../providers";
import { Profile } from "../components/Profile";

// `app/page.tsx` is the UI for the `/` URL

export default function Page({ params }: { params: { slug: string } }) {
	const did = params.slug ?? "";
	return (
		<BasePage title="Profile" description={`did: ${did}`}>
			<Profile />
		</BasePage>
	);
}
