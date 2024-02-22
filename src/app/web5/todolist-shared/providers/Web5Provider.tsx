import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { configureProtocol, initDWN } from "./utils";

interface Web5ContextState {
	web5: any;
	did: string;
	updateProtocol: (protocolDefinition: any) => void;
}

const Web5Context = createContext<Web5ContextState>({
	did: "",
	web5: [],
	updateProtocol: () => {},
});

export const Web5Provider = ({ children, protocolDefinition }) => {
	const [web5, setWeb5] = useState(null);
	const [did, setDID] = useState("");

	useEffect(() => {
		// create DID and Web5 instance
		initDWN({
			onSuccess: ({ web5, did }) => {
				setWeb5(web5);
				setDID(did);
				configureProtocol({ web5, did, protocolDefinition });
			},
		});
	}, [protocolDefinition]);

	const updateProtocol = useCallback(
		(protocolDefinition) => {
			configureProtocol({ web5, protocolDefinition });
		},
		[web5],
	);

	const value = useMemo(
		() => ({
			did,
			web5,
			updateProtocol,
		}),
		[did, web5, updateProtocol],
	);

	return <Web5Context.Provider value={value}>{children}</Web5Context.Provider>;
};

export const useWeb5 = () => {
	const context = useContext(Web5Context);
	if (!context) {
		throw new Error("useTodoListManager must be used within a Web5Provider");
	}
	return context;
};
