import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	createTodoRecord,
	deleteRecord,
	getTodoRecipient,
	retrieveList,
	updateRecord,
} from "./utils";
import { useWeb5 } from "./Web5Provider";
import { List } from "./ListsProvider";

export interface Todo {
	record: any;
	data: {
		completed: boolean;
		description: string;
	};
	id: string;
}
export interface TodoData {
	"@type": "todo";
	completed: boolean;
	description: string;
	author: string;
	recipient: string;
	parentId: string;
}

interface TodoContextState {
	todos: Todo[];
	createTodo: any;
	deleteTodo: any;
	updateTodo: any;
}

const TodoContext = createContext<TodoContextState>({
	todos: [],
	createTodo: () => {},
	deleteTodo: () => {},
	updateTodo: () => {},
});

export const ListProvider = ({ children, protocolDefinition, listId }: any) => {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [list, setList] = useState<List[]>([]);
	const { web5, did } = useWeb5();

	useEffect(() => {
		if (!web5 || !did) return;

		retrieveList({
			web5,
			listId,
			onSuccess: ({ todos, list }) => {
				console.log("....got todos and list from DWN", todos, list);
				setTodos(todos);
				setList(list);
			},
		});
	}, [setTodos, listId, did, web5]);

	const getNewTodoData = useCallback(
		({
			completed,
			description,
		}: // recipientDID,
		{
			completed: boolean;
			description: string;
			// recipientDID: string;
		}): TodoData => {
			return {
				"@type": "todo",
				completed,
				description,
				author: did,
				// TODO: add ability to assign todo to someone
				recipient: getTodoRecipient({ myDID: did, list }),
				parentId: listId,
			};
		},
		[did, list, listId],
	);

	const createTodo = useCallback(
		({
			newTodoInput,
			recipientDID,
			onSuccess,
		}: {
			newTodoInput: any;
			recipientDID: any;
			onSuccess: any;
		}) => {
			const newTodoData = getNewTodoData({
				completed: newTodoInput.completed,
				description: newTodoInput.description,
				// TODO: add ability to assign todo to someone
				// recipientDID: recipientDID,
			});
			// create the record in DWN
			createTodoRecord({ web5, protocolDefinition })({
				newTodoData: newTodoData,
				onSuccess: ({ todo }: { todo: Todo }) => {
					console.log("....added todo to DWN", todo);
					setTodos([...todos, todo]);
					onSuccess();
				},
			});
		},
		[web5, todos, protocolDefinition, getNewTodoData],
	);

	const deleteTodo = useCallback(
		({ recordId, onSuccess }: any) => {
			// create the record in DWN
			deleteRecord(web5)({
				recordId,
				onSuccess: () => {
					console.log(`....deleted todo ${recordId} from DWN`);
					setTodos(todos.filter(({ id }) => id !== recordId));
					onSuccess();
				},
			});
		},
		[web5, todos],
	);

	const updateTodo = useCallback(
		({ recordId, updatedTodoData, onSuccess }: any) => {
			updateRecord(web5)({
				recordId,
				updatedTodoData,
				onSuccess: () => {
					setTodos(
						todos.map((todo) => {
							if (todo.id === recordId) {
								return { ...todo, data: updatedTodoData };
							}
							return todo;
						}),
					);
					console.log(`....updated todo ${recordId} in DWN`);
					onSuccess();
				},
			});
			onSuccess();
		},
		[web5, todos],
	);

	const value = useMemo(
		() => ({
			todos,
			createTodo,
			deleteTodo,
			updateTodo,
		}),
		[todos, createTodo, deleteTodo, updateTodo],
	);

	return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useList = () => {
	const context = useContext(TodoContext);
	if (!context) {
		throw new Error("useTodoListManager must be used within a Web5Provider");
	}
	return context;
};
