// This schema actually doesn't matter at all for this app
// For a real app, we would want to define our own schema
// and host it somewhere like S3, google cloud storage, or github
export const TODO_SCHEMA = "https://schema.org/ToDo";

export interface Todo {
	record: any;
	data: {
		completed: boolean;
		description: string;
	};
	id: string;
}

export interface TodoDwnContextState {
	did: string;
	todos: Todo[];
	addTodo: any;
	deleteTodo: any;
	updateTodo: any;
}

export interface NewTodoData {
	"@type": "list";
	completed: boolean;
	description: string;
	author: string;
	recipient: string;
}
