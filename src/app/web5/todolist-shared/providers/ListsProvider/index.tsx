import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { createListRecord, retrieveLists } from "./utils";
import { useWeb5 } from "../Web5Provider";

export interface NewListInput {
	title: string;
	description: string;
	recipientDID: string;
}

export interface ListData {
	"@type": "list";
	title: string;
	description: string;
	author: string;
	recipient?: string;
}

export interface List {
	data: ListData;
	id: string;
	record: any;
}

export interface ListsContextState {
	lists: List[];
	createList: any;
}

const ListsContext = createContext<ListsContextState>({
	lists: [],
	createList: () => {},
});

export const ListsProvider = ({ children, protocolDefinition }: any) => {
	const [lists, setLists] = useState<List[]>([]);
	const { web5, did } = useWeb5();
	useEffect(() => {
		if (!web5 || !did) return;

		retrieveLists({
			web5,
			did,
			protocolDefinition,
			onSuccess: ({ lists }: any) => {
				console.log("....got todo lists from DWN", lists);
				setLists(lists);
			},
		});
	}, [web5, did, setLists, protocolDefinition]);

	const getNewListData = useCallback(
		({ title, description, recipientDID }: NewListInput): ListData => {
			return {
				"@type": "list",
				title,
				description,
				author: did,
				recipient: recipientDID || undefined,
			};
		},
		[did],
	);

	const createList = useCallback(
		({
			newListInput,
			onSuccess,
		}: {
			newListInput: NewListInput;
			onSuccess: any;
		}) => {
			const newListData = getNewListData(newListInput);

			// create the record in DWN
			createListRecord({ web5, did, protocolDefinition })({
				newListData,
				recipientDID: newListData.recipient, // TODO: replace with actual recipientDID
				onSuccess: ({ list }: { list: any }) => {
					setLists([...lists, list]);
					onSuccess();
				},
			});
		},
		[web5, did, lists, getNewListData, protocolDefinition],
	);

	const value = useMemo(
		() => ({
			lists,
			createList,
		}),
		[lists, createList],
	);

	return (
		<ListsContext.Provider value={value}>{children}</ListsContext.Provider>
	);
};

export const useLists = () => {
	const context = useContext(ListsContext);
	if (!context) {
		throw new Error("useLists must be used within a ListsProvider");
	}
	return context;
};
