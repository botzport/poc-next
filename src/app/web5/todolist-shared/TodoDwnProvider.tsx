import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	configureProtocol,
	createRecord,
	deleteRecord,
	initDWN,
	populateTodos,
	retrieveTodos,
	updateRecord,
} from "./utils";
import { Todo, TodoDwnContextState } from "./constants";

const TodoDwnContext = createContext<TodoDwnContextState>({
	did: "",
	todos: [],
	addTodo: () => {},
	deleteTodo: () => {},
	updateTodo: () => {},
});

export const TodoDwnProvider = ({ children, protocolDefinition }) => {
	const [web5, setWeb5] = useState(null);
	const [did, setDID] = useState("");
	const [todos, setTodos] = useState<Todo[]>([]);

	useEffect(() => {
		// create DID and Web5 instance
		initDWN({
			onSuccess: ({ web5, did }) => {
				setWeb5(web5);
				setDID(did);
				console.log("....created DID", did);
				configureProtocol({ web5, protocolDefinition });
				// get todos from DWN
				retrieveTodos({
					web5,
					protocolDefinition,
					onSuccess: ({ todos }) => {
						console.log("....got todos from DWN", todos);
						setTodos(todos);
					},
				});
			},
		});
	}, [setTodos, protocolDefinition]);

	const getNewTodo = useCallback(
		({
			completed,
			description,
			recipientDID,
		}: {
			completed: boolean;
			description: string;
			recipientDID: string;
		}) => {
			return {
				"@type": "list",
				completed,
				description,
				author: did,
				recipient: recipientDID,
			};
		},
		[did],
	);

	const addTodo = useCallback(
		({ newTodoData, recipientDID, onSuccess }) => {
			const newShardListData = getNewTodo({
				completed: newTodoData.completed,
				description: newTodoData.description,
				recipientDID: recipientDID,
			});
			// create the record in DWN
			createRecord({ web5, protocolDefinition })({
				newTodoData: newShardListData,
				recipientDID: did, // TODO: replace with actual recipientDID
				onSuccess: ({ todo }: { todo: Todo }) => {
					console.log("....added todo to DWN", todo);
					setTodos([...todos, todo]);
					onSuccess();
				},
			});
		},
		[web5, todos, protocolDefinition, getNewTodo, did],
	);

	const deleteTodo = useCallback(
		({ recordId, onSuccess }) => {
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
		({ recordId, updatedTodoData, onSuccess }) => {
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
			did,
			todos,
			addTodo,
			deleteTodo,
			updateTodo,
		}),
		[did, todos, addTodo, deleteTodo, updateTodo],
	);

	return (
		<TodoDwnContext.Provider value={value}>{children}</TodoDwnContext.Provider>
	);
};

export const useTodoListManager = () => {
	const context = useContext(TodoDwnContext);
	if (!context) {
		throw new Error("useTodoListManager must be used within a Web5Provider");
	}
	return context;
};
