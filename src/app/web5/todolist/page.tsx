import { TodoList } from "./TodoList";
import { BasePage } from "@/app/shared/BasePage";

// `app/page.tsx` is the UI for the `/` URL

const PAGE_DESCRIPTION = "web5 todo list with browser local storage DWN";

export default function Page() {
	return (
		<BasePage title="Web5 Todo List" description={PAGE_DESCRIPTION}>
			<TodoList />
		</BasePage>
	);
}
