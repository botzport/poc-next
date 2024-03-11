import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { IdentityAgent } from "@web5/identity-agent";
import { createAgent, genCreateIdentity } from "./utils";

interface AgentContextState {
	agent: any;
	identities: any[];
	addIdentity: (args: { name: string }) => void;
}

const AgentContext = createContext<AgentContextState>({
	agent: null,
	identities: [],
	addIdentity: (args: { name: string }) => {},
});

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
	const [agent, setAgent] = useState<IdentityAgent | null>(null);
	const [identities, setIdentities] = useState<any[]>([]);

	useEffect(() => {
		createAgent({
			onSuccess: ({ agent }: { agent: IdentityAgent }) => {
				console.log("agent created", agent);
				setAgent(agent);
			},
		});
	}, []);

	const createIdentity = useMemo(() => genCreateIdentity(agent), [agent]);

	const addIdentity = useCallback(
		({ name }: { name: string }) => {
			createIdentity({
				name,
				onSuccess: ({ did }) => {
					console.log("identity created", did);
					setIdentities((prev) => [...prev, { name, did }]);
				},
			});
		},
		[createIdentity],
	);

	const value = useMemo(
		() => ({
			agent,
			identities,
			addIdentity,
		}),
		[agent, identities, addIdentity],
	);

	return (
		<AgentContext.Provider value={value}>{children}</AgentContext.Provider>
	);
};

export const useAgent = () => {
	const context = useContext(AgentContext);
	if (!context) {
		throw new Error("useAgent must be used within a AgentProvider");
	}
	return context;
};
