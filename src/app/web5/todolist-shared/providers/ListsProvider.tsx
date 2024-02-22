import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { createListRecord, retrieveLists } from "./utils";
import { TodoList } from "../constants";
import { useWeb5 } from "./Web5Provider";

export interface ListsContextState {
	lists: TodoList[];
	addList: any;
}

const ListsContext = createContext<ListsContextState>({
	lists: [],
	addList: () => {},
});

export const ListsProvider = ({ children, protocolDefinition }: any) => {
	const [lists, setLists] = useState<TodoList[]>([]);
	const { web5, did } = useWeb5();
	useEffect(() => {
		retrieveLists({
			web5,
			protocolDefinition,
			onSuccess: ({ lists }: any) => {
				console.log("....got todo lists from DWN", lists);
				setLists(lists);
			},
		});
	}, [web5, setLists, protocolDefinition]);

	const getNewList = useCallback(
		({
			title,
			description,
			recipientDID,
		}: {
			title: string;
			description: string;
			recipientDID: string;
		}) => {
			return {
				"@type": "list",
				title,
				description,
				author: did,
				recipient: recipientDID,
			};
		},
		[did],
	);

	const addList = useCallback(
		({ newListData, recipientDID, onSuccess }: any) => {
			const newShardListData = getNewList({
				title: newListData.title,
				description: newListData.description,
				recipientDID: recipientDID,
			});
			// create the record in DWN
			createListRecord({ web5, protocolDefinition })({
				newTodoData: newShardListData,
				recipientDID: did, // TODO: replace with actual recipientDID
				onSuccess: ({ list }: { list: any }) => {
					console.log("....added list to DWN", list);
					setLists([...lists, list]);
					onSuccess();
				},
			});
		},
		[web5, lists, getNewList, protocolDefinition, did],
	);

	const value = useMemo(
		() => ({
			lists,
			addList,
		}),
		[lists, addList],
	);

	return (
		<ListsContext.Provider value={value}>{children}</ListsContext.Provider>
	);
};

export const useTodoListManager = () => {
	const context = useContext(ListsContext);
	if (!context) {
		throw new Error("useTodoListManager must be used within a Web5Provider");
	}
	return context;
};
