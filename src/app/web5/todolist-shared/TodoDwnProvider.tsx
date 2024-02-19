import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	createRecord,
	deleteRecord,
	initDWN,
	populateTodos,
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

export const TodoDwnProvider = ({ children }) => {
	const [web5, setWeb5] = useState(null);
	const [did, setDID] = useState("");
	const [todos, setTodos] = useState<Todo[]>([]);
	useEffect(() => {
		// create DID and Web5 instance
		initDWN({
			onSuccess: ({ web5, did }) => {
				setWeb5(web5);
				setDID(did);
				// get todos from DWN
				populateTodos({
					web5,
					onSuccess: ({ todos }) => {
						console.log("....got todos from DWN", todos);
						setTodos(todos);
					},
				});
			},
		});
	}, [setTodos]);

	const addTodo = useCallback(
		({ newTodoData, onSuccess }) => {
			// create the record in DWN
			createRecord(web5)({
				newTodoData,
				onSuccess: ({ todo }: { todo: Todo }) => {
					console.log("....added todo to DWN", todo);
					setTodos([...todos, todo]);
					onSuccess();
				},
			});
		},
		[web5, todos],
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

export const useWeb5 = () => {
	const context = useContext(TodoDwnContext);
	if (!context) {
		throw new Error("useWeb5 must be used within a Web5Provider");
	}
	return context;
};
