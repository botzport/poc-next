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
	addIdentity: (args: { name: string; onSuccess: () => void }) => void;
}

const AgentContext = createContext<AgentContextState>({
	agent: null,
	identities: [],
	addIdentity: (args: { name: string }) => {},
});

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
	const [agent, setAgent] = useState<IdentityAgent | null>(null);
	const [identities, setIdentities] = useState<any[]>([
		// TODO: temp for testing. Remove after identity agent works
		{ name: "Default", did: "did:web5:default" },
		{ name: "Default2", did: "did:web5:default2" },
	]);

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
		({ name, onSuccess }: { name: string; onSuccess: () => void }) => {
			createIdentity({
				name,
				onSuccess: ({ did }) => {
					console.log("identity created", did);
					setIdentities((prev) => [...prev, { name, did }]);
					onSuccess();
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
