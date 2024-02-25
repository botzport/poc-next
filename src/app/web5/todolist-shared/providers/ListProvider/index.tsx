import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	getTodoRecipient,
	genCreateTodoRecord,
	genDeleteTodoRecord,
	genRetrieveTodoList,
	genUpdateTodoRecord,
} from "./utils";
import { useWeb5 } from "../Web5Provider";
import { List } from "../ListsProvider";

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
	const [list, setList] = useState<List | null>(null);
	const { web5, did } = useWeb5();

	const retrieveTodoList = useMemo(
		() => genRetrieveTodoList({ web5, did }),
		[web5, did],
	);
	const createTodoRecord = useMemo(
		() => genCreateTodoRecord({ web5, did, protocolDefinition }),
		[web5, did, protocolDefinition],
	);
	const deleteTodoRecord = useMemo(
		() => genDeleteTodoRecord({ web5, did }),
		[web5, did],
	);
	const updateTodoRecord = useMemo(
		() => genUpdateTodoRecord({ web5, did }),
		[web5, did],
	);

	useEffect(() => {
		if (!web5 || !did) return;

		retrieveTodoList({
			listId,
			onSuccess: ({ todos, list }) => {
				console.log("....got todos and list from DWN", todos, list);
				setTodos(todos);
				setList(list);
			},
		});
	}, [retrieveTodoList, setTodos, listId, did, web5]);

	const getNewTodoData = useCallback(
		({
			completed,
			description,
			recipientDID,
		}: {
			completed: boolean;
			description: string;
			recipientDID: string;
		}): TodoData => {
			return {
				"@type": "todo",
				completed,
				description,
				author: did,
				recipient: recipientDID,
				parentId: listId,
			};
		},
		[did, listId],
	);

	const createTodo = useCallback(
		({
			newTodoInput,
			recipientDID,
			onSuccess,
		}: {
			newTodoInput: any;
			recipientDID?: string;
			onSuccess: any;
		}) => {
			const newTodoData = getNewTodoData({
				completed: newTodoInput.completed,
				description: newTodoInput.description,
				recipientDID: recipientDID ?? getTodoRecipient({ did, list }),
			});

			createTodoRecord({
				newTodoData: newTodoData,
				onSuccess: ({ todo }: { todo: Todo }) => {
					setTodos([...todos, todo]);
					onSuccess();
				},
			});
		},
		[did, todos, list, createTodoRecord, getNewTodoData],
	);

	const deleteTodo = useCallback(
		({ recordId, onSuccess }: any) => {
			// create the record in DWN
			deleteTodoRecord({
				recordId,
				onSuccess: () => {
					console.log(`....deleted todo ${recordId} from DWN`);
					setTodos(todos.filter(({ id }) => id !== recordId));
					onSuccess();
				},
			});
		},
		[todos, deleteTodoRecord],
	);

	const updateTodo = useCallback(
		({ recordId, updatedTodoData, onSuccess }: any) => {
			updateTodoRecord({
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
		[todos, updateTodoRecord],
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
