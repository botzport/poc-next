"use client";

// `app/page.tsx` is the UI for the `/` URL

const ROUTES = ["/web5/todolist"];

export default function Page() {
	return (
		<>
			<h1>Hello, Home page!</h1>
			{ROUTES.map((route) => (
				<a key={route} href={route}>
					{route}
				</a>
			))}
		</>
	);
}
