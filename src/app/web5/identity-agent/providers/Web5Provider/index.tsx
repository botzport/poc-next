import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Web5 } from "@web5/api";
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

export const Web5Provider = ({
	children,
	protocolDefinition,
	connectedDid,
}: {
	children: React.ReactNode;
	protocolDefinition: unknown;
}) => {
	const [web5, setWeb5] = useState<Web5 | null>(null);
	const [did, setDID] = useState("");

	useEffect(() => {
		// create DID and Web5 instance
		initDWN({
			onSuccess: ({ web5, did }: { web5: Web5; did: string }) => {
				setWeb5(web5);
				setDID(did);
				configureProtocol({ web5, did, protocolDefinition });
			},
		});
	}, [protocolDefinition]);

	const updateProtocol = useCallback(
		(protocolDefinition: unknown) => {
			configureProtocol({ web5, did, protocolDefinition });
		},
		[web5, did],
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
