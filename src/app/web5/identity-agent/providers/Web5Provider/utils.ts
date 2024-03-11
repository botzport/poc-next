import { Web5 } from "@web5/api";
import { IdentityAgent } from "@web5/identity-agent";

const TEST_DID = "did:dht:u1ehqfo7jpryedm7rqxyazh51pao4cz9xo7nuwohc77bumx49zdo";

// TODO: must pass both agent and connectedDid to Web5.connect
export const initDWN = async ({
	agent,
	connectedDid,
	onSuccess,
}: {
	agent: IdentityAgent;
	connectedDid: string;
	onSuccess: ({ web5 }: { web5: Web5 }) => void;
}) => {
	const { web5, did } = await Web5.connect({ agent, connectedDid: TEST_DID });
	// unless you pass the agent, the web5 connect will always bootstrap a new did
	console.log("web5, did", web5, did);
	if (web5) {
		onSuccess({ web5 });
		return;
	}
	console.error("Failed to connect to DWN");
};

// Not used but can be useful
export const getDidDocument = async ({ web5, did }) => {
	const resolution = await web5.did.resolve(did);
	const didDocument = resolution.didDocument;
	// console.log("didDocument", didDocument);
	return didDocument;
};
