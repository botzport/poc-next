import { LocalKeyManager } from "@web5/crypto";
import { IdentityAgent } from "@web5/identity-agent";
import { DidDht } from "@web5/dids";

export const createAgent = async ({ onSuccess }) => {
	const agent = await IdentityAgent.create();
	if (agent) {
		onSuccess({ agent });
		return;
	}
	console.error("Failed to create identity agent");
};

export const genCreateIdentity =
	({
		agent,
		keyManager,
	}: {
		agent: IdentityAgent;
		keyManager: LocalKeyManager;
	}) =>
	async ({ name, onSuccess }) => {
		if (!agent) return;
		// Creates a DID using the DHT method and publishes the DID Document to the DHT
		const didDht = await DidDht.create({ keyManager });
		const portableDid = await didDht.export();
		const didDocument = JSON.stringify(didDht.document);

		// DID string
		const did = didDht.uri;

		// Doesn't work because https://github.com/TBD54566975/web5-js/issues/440
		// create managed identity
		// const identity = await agent.identityManager.create({
		// 	name,
		// 	kms: "local",
		// 	did: portableDid as any,
		// });

		const privateKey = portableDid.privateKeys?.[0];

		console.log(".....portableDid", portableDid);
		console.log(".....didDocument", didDocument);
		if (privateKey) {
			const keyUri = await keyManager.getKeyUri({ key: privateKey });
			onSuccess({ did, keyUri });
		}
	};
