"use client";

import { useEffect, useState } from "react";
import { BasePage } from "@/app/shared/BasePage";

// import { getData } from "./components/utils";
import { Web5Provider } from "./providers";
import { Profiles } from "./components/Profiles";

// `app/page.tsx` is the UI for the `/` URL

const PAGE_DESCRIPTION =
	"Create new DID, manage profiles, and grant other apps access to DID profiles";

export default function Page() {
	return (
		// <Web5Provider>
		<BasePage title="Profile" description={PAGE_DESCRIPTION}>
			<Profiles />
		</BasePage>
		// </Web5Provider>
	);
}
