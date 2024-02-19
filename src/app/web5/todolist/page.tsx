import { TodoList } from "./TodoList";
import { BasePage } from "@/app/shared/BasePage";

// `app/page.tsx` is the UI for the `/` URL

export default function Page() {
	return (
		<BasePage title="Web5 Todo List">
			<TodoList />
		</BasePage>
	);
}
