import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { LocalKeyManager } from "@web5/crypto";
import { IdentityAgent } from "@web5/identity-agent";
import { createAgent, genCreateIdentity } from "./utils";

interface AgentContextState {
	agent: any;
	keyManager: LocalKeyManager | null;
	identities: any[];
	addIdentity: (args: { name: string; onSuccess: () => void }) => void;
}

interface Identity {
	name: string;
	did: string;
	keyUri: string;
}

const AgentContext = createContext<AgentContextState>({
	agent: null,
	keyManager: null,
	identities: [],
	addIdentity: (args: { name: string }) => {},
});

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
	const [agent, setAgent] = useState<IdentityAgent | null>(null);
	const [keyManager, setKeyManager] = useState<LocalKeyManager | null>(null);

	const [identities, setIdentities] = useState<Identity[]>([]);

	useEffect(() => {
		createAgent({
			onSuccess: ({ agent }: { agent: IdentityAgent }) => {
				console.log("agent created", agent);
				setAgent(agent);
				setKeyManager(new LocalKeyManager());
			},
		});
	}, []);
	console.log("agent", agent);
	console.log("keyManager", keyManager);
	const createIdentity = useMemo(
		() => genCreateIdentity({ agent, keyManager }),
		[agent, keyManager],
	);

	const addIdentity = useCallback(
		({ name, onSuccess }: { name: string; onSuccess: () => void }) => {
			createIdentity({
				name,
				onSuccess: ({ did, keyUri }) => {
					console.log("identity created", did);
					setIdentities((prev) => [...prev, { name, did, keyUri }]);
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
			keyManager,
		}),
		[agent, identities, addIdentity, keyManager],
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
