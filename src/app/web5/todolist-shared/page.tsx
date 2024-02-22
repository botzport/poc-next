"use client";

import { useEffect, useState } from "react";
import { BasePage } from "@/app/shared/BasePage";
import { DIDViewer } from "./components/DIDViewer";
import { Web5Provider, ListsProvider } from "./providers";
import { getData } from "./providers/utils";
import { Lists } from "./components/Lists";

// `app/page.tsx` is the UI for the `/` URL

const PAGE_DESCRIPTION = "multi-user web5 todo list with DWN sync";

export default function Page() {
	const [data, setData] = useState(null);
	useEffect(() => {
		getData({
			onSuccess: (data) => {
				setData(data);
			},
		});
	}, [setData]);

	if (!data) return null;
	console.log("data", data);
	return (
		<Web5Provider protocolDefinition={data}>
			<BasePage title="Web5 Shared Todo List" description={PAGE_DESCRIPTION}>
				<DIDViewer />
				<ListsProvider protocolDefinition={data}>
					<Lists />
				</ListsProvider>
			</BasePage>
		</Web5Provider>
	);
}
