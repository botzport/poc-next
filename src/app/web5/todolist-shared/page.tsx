"use client";

import { SharedTodoList } from "./SharedTodoList";
import { BasePage } from "@/app/shared/BasePage";
import { useEffect, useState } from "react";
import { TodoDwnProvider } from "./TodoDwnProvider";

// `app/page.tsx` is the UI for the `/` URL

const PAGE_DESCRIPTION = "multi-user web5 todo list with DWN sync";

async function getData({ onSuccess }) {
	const res = await fetch("http://localhost:3000/api/todolist-shared");
	// The return value is *not* serialized
	// You can return Date, Map, Set, etc.

	if (!res.ok) {
		// This will activate the closest `error.js` Error Boundary
		throw new Error("Failed to fetch data");
	}
	const resp = await res.json();
	onSuccess(resp);
	return resp;
}

export default function Page() {
	const [data, setData] = useState(null);
	useEffect(() => {
		getData({
			onSuccess: (data) => {
				setData(data);
			},
		});
	}, [setData]);

	console.log("data", data);
	return (
		<BasePage title="Web5 Shared Todo List" description={PAGE_DESCRIPTION}>
			<TodoDwnProvider>
				<SharedTodoList />
			</TodoDwnProvider>
		</BasePage>
	);
}
