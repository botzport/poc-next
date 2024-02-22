"use client";

import { useEffect, useState } from "react";
import { BasePage } from "@/app/shared/BasePage";
import { List } from "../components/List";
import { Web5Provider, ListProvider } from "../providers";
import { getData } from "../providers/utils";

// `app/page.tsx` is the UI for the `/` URL

export default function Page({ params }: { params: { slug: string } }) {
	const [data, setData] = useState(null);
	useEffect(() => {
		getData({
			onSuccess: (data) => {
				setData(data);
			},
		});
	}, [setData]);

	if (!data) return null;

	return (
		<Web5Provider protocolDefinition={data}>
			<BasePage title="Todo List" description={params.slug ?? ""}>
				<ListProvider protocolDefinition={data}>
					<List />
				</ListProvider>
			</BasePage>
		</Web5Provider>
	);
}
