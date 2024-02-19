import { TodoList } from "./TodoList";

// `app/page.tsx` is the UI for the `/` URL

const isSSREnabled = () => typeof window === "undefined";

export default function Page() {
	return (
		<>
			<h1>Web5 TODO</h1>
			<TodoList />
		</>
	);
}
