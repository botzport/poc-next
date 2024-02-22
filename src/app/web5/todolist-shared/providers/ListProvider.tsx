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
	retrieveTodos,
	updateRecord,
} from "./utils";
import { Todo } from "../constants";
import { useWeb5 } from "./Web5Provider";

interface TodoContextState {
	todos: Todo[];
	addTodo: any;
	deleteTodo: any;
	updateTodo: any;
}

const TodoContext = createContext<TodoContextState>({
	todos: [],
	addTodo: () => {},
	deleteTodo: () => {},
	updateTodo: () => {},
});

export const ListProvider = ({ children, protocolDefinition }) => {
	const [todos, setTodos] = useState<Todo[]>([]);
	const { web5, did } = useWeb5();

	useEffect(() => {
		if (!web5 || !did) return;

		retrieveTodos({
			web5,
			protocolDefinition,
			onSuccess: ({ todos }) => {
				console.log("....got todos from DWN", todos);
				setTodos(todos);
			},
		});
	}, [setTodos, protocolDefinition, did, web5]);

	const getNewTodo = useCallback(
		({
			completed,
			description,
		}: // recipientDID,
		{
			completed: boolean;
			description: string;
			// recipientDID: string;
		}) => {
			return {
				"@type": "todo",
				completed,
				description,
				author: did,
				// TODO: add ability to assign todo to someone
				// recipient: recipientDID,
			};
		},
		[did],
	);

	const addTodo = useCallback(
		({ newTodoData, recipientDID, onSuccess }: any) => {
			const newShardListData = getNewTodo({
				completed: newTodoData.completed,
				description: newTodoData.description,
				// recipientDID: recipientDID,
			});
			// create the record in DWN
			createTodoRecord({ web5, protocolDefinition })({
				newTodoData: newShardListData,
				// recipientDID: did, // TODO: add ability to assign todo to someone
				onSuccess: ({ todo }: { todo: Todo }) => {
					console.log("....added todo to DWN", todo);
					setTodos([...todos, todo]);
					onSuccess();
				},
			});
		},
		[web5, todos, protocolDefinition, getNewTodo],
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
			addTodo,
			deleteTodo,
			updateTodo,
		}),
		[todos, addTodo, deleteTodo, updateTodo],
	);

	return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useListManager = () => {
	const context = useContext(TodoContext);
	if (!context) {
		throw new Error("useTodoListManager must be used within a Web5Provider");
	}
	return context;
};
