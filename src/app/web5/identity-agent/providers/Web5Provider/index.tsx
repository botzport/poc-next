import { IdentityAgent } from "@web5/identity-agent";
import { Web5 } from "@web5/api";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { initDWN } from "./utils";

interface Web5ContextState {
	web5: any;
}

const Web5Context = createContext<Web5ContextState>({
	web5: null,
});

export const Web5Provider = ({
	children,
	did,
	agent,
}: {
	children: React.ReactNode;
	did: string;
	agent: IdentityAgent;
}) => {
	const [web5, setWeb5] = useState<Web5 | null>(null);

	useEffect(() => {
		console.log(".....web5Provider: did", did);
		// create DID and Web5 instance
		initDWN({
			agent,
			connectedDid: did,
			onSuccess: ({ web5 }: { web5: Web5; did: string }) => {
				setWeb5(web5);
			},
		});
	}, [did]);

	const value = useMemo(
		() => ({
			web5,
		}),
		[web5],
	);

	return <Web5Context.Provider value={value}>{children}</Web5Context.Provider>;
};

export const useWeb5 = () => {
	const context = useContext(Web5Context);
	if (!context) {
		throw new Error("useWeb5 must be used within a Web5Provider");
	}
	return context;
};
