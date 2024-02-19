"use client";

import { Box } from "@chakra-ui/react";

// `app/page.tsx` is the UI for the `/` URL

const ROUTES = ["/web5/todolist", "web5/todolist-shared"];

export default function Page() {
	return (
		<>
			<h1>Hello, Home page!</h1>
			{ROUTES.map((route) => (
				<Box key={route}>
					<a href={route}>{route}</a>
				</Box>
			))}
		</>
	);
}
