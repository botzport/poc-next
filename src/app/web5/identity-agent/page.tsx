"use client";

import { BasePage } from "@/app/shared/BasePage";

import { Profiles } from "./components/Profiles";
import { AgentProvider } from "./providers/AgentProvider";

// `app/page.tsx` is the UI for the `/` URL

const PAGE_DESCRIPTION =
	"Create new identity agent to create new DIDs and view existing DIDs.";

export default function Page() {
	return (
		<AgentProvider>
			<BasePage title="Identity Agent" description={PAGE_DESCRIPTION}>
				<Profiles />
			</BasePage>
		</AgentProvider>
	);
}
