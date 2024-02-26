import { Web5 } from "@web5/api";

// checks if the protocol is installed and installs it if it isn't
export const configureProtocol = async ({ web5, did, protocolDefinition }) => {
	// query the list of existing protocols on the DWN
	const { protocols, status } = await web5.dwn.protocols.query({
		message: {
			filter: {
				protocol: protocolDefinition.protocol,
			},
		},
	});

	if (status.code !== 200) {
		alert("Error querying protocols");
		console.error("Error querying protocols", status);
		return;
	}

	// if the protocol already exists, we return
	if (protocols.length > 0) {
		console.log("Protocol already exists");
		return;
	}

	// configure protocol on local DWN
	const { status: configureStatus, protocol } =
		await web5.dwn.protocols.configure({
			message: {
				definition: protocolDefinition,
			},
		});

	// sends the protocol configuration to the user's other DWeb Nodes
	protocol.send(did);

	console.log("Protocol configured", configureStatus, protocol);
};

export const initDWN = async ({ onSuccess }) => {
	const { web5, did } = await Web5.connect();
	if (web5 && did) {
		onSuccess({ web5, did });
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
