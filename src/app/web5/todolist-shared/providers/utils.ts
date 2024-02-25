import { Web5 } from "@web5/api";

export async function getData({ onSuccess }) {
	const res = await fetch("http://localhost:3000/api/todolist-shared", {
		cache: "no-cache",
	});
	// The return value is *not* serialized
	// You can return Date, Map, Set, etc.

	if (!res.ok) {
		// This will activate the closest `error.js` Error Boundary
		throw new Error(`Failed to fetch data ${JSON.stringify(res)}`);
	}
	const resp = await res.json();
	onSuccess(resp);
	return resp;
}

export const initDWN = async ({ onSuccess }) => {
	const { web5, did } = await Web5.connect();
	if (web5 && did) {
		onSuccess({ web5, did });
		return;
	}
	console.error("Failed to connect to DWN");
};

// for a shared todo list, if I created the list, then the recipient of the todo is always me (my todo)
// if someone else created the list, the recipient is always them (their todo)
export const getTodoRecipient = ({ myDID, list }) => {
	debugger;
	if (myDID === list.author) {
		return list.recipient;
	} else {
		return list.author;
	}
};

export const createTodoRecord = ({ web5, protocolDefinition }) => {
	const dataFormat = protocolDefinition.types.todo.dataFormats[0];
	const protocol = protocolDefinition.protocol;
	const schema = protocolDefinition.types.todo.schema;

	return async ({ newTodoData, onSuccess }) => {
		try {
			const { record } = await web5.dwn.records.create({
				data: newTodoData,
				message: {
					protocol,
					protocolPath: "list/todo",
					schema,
					dataFormat,
					parentId: newTodoData.parentId,
					contextId: newTodoData.parentId,
				},
			});

			const data = await record.data.json();

			const todo = {
				record,
				data,
				id: record.id,
			};

			const { recipient } = newTodoData;
			if (recipient) {
				console.log("Sending this todo record to recipient", record);
				const { status: sendStatus } = await record.send(recipient);

				if (sendStatus.code !== 202) {
					console.error(
						`Unable to send to target did ${JSON.stringify(sendStatus)}`,
					);
					return;
				} else {
					// success case
					console.log("Shared todo sent to recipient", recipient);
				}
			}

			onSuccess({ todo });
		} catch (e) {
			console.error("Error creating todo record", e);
		}
	};
};

export const createListRecord = ({
	web5,
	did,
	protocolDefinition,
}: {
	web5: Web5;
	did: string;
	protocolDefinition: any;
}) => {
	const dataFormat = protocolDefinition.types.list.dataFormats[0];
	const protocol = protocolDefinition.protocol;
	const schema = protocolDefinition.types.list.schema;

	return async ({ newListData, recipientDID, onSuccess }) => {
		try {
			const { record } = await web5.dwn.records.create({
				data: newListData,
				message: {
					protocol,
					protocolPath: "list",
					schema,
					dataFormat,
					recipient: recipientDID,
				},
			});

			if (!record) {
				console.error("Error creating record for new list");
				return;
			}

			// always send to self because we want the the remote datastore as source of truth
			// for both sender and recipient
			const { status: sendToSelfStatus } = await record.send(did);
			console.log("Sending this list to self", sendToSelfStatus);

			const data = await record.data.json();

			const list = {
				record,
				data,
				id: record.id,
			};

			if (recipientDID) {
				console.log("Sending this list record to recipient", record);
				const { status: sendStatus } = await record.send(recipientDID);

				if (sendStatus.code !== 202) {
					console.error(
						`Unable to send to target did ${JSON.stringify(sendStatus)}`,
					);
					return;
				} else {
					// success case
					console.log("Shared list sent to recipient", recipientDID);
				}
			}

			onSuccess({ list });
		} catch (e) {
			console.error("Error creating record", e);
		}
	};
};

export const deleteRecord =
	(web5) =>
	async ({ recordId, onSuccess }) => {
		// Delete the record in DWN
		await web5.dwn.records.delete({
			message: {
				recordId,
			},
		});

		onSuccess();
	};

export const updateRecord =
	(web5) =>
	async ({ recordId, updatedTodoData, onSuccess }) => {
		// Get the record in DWN
		const { record } = await web5.dwn.records.read({
			message: {
				filter: {
					recordId,
				},
			},
		});

		// Update the record in DWN
		await record.update({ data: updatedTodoData });

		onSuccess();
	};

export const retrieveList = async ({
	web5,
	did,
	listId,
	onSuccess,
}: {
	web5: Web5;
	did: string;
	listId: string;
	onSuccess: any;
}) => {
	// fetch shared list details from remote datastore
	const { record: listRecord } = await web5.dwn.records.read({
		from: did,
		message: {
			filter: {
				recordId: listId,
			},
		},
	});

	const list = await listRecord?.data.json();
	if (!list) {
		console.error("Error reading list record");
		return;
	}
	console.log("debug: list", list);

	// fetch todos under list
	const { records: todoRecords = [] } = await web5.dwn.records.query({
		from: "TEST_DID",
		message: {
			filter: {
				parentId: listId,
			},
			dateSort: "createdAscending",
		},
	});

	console.log("debug: todoRecords", todoRecords);
	// add entry to array

	const todos = [];
	for (let record of todoRecords) {
		const data = await record.data.json();
		const todo = { record, data, id: record.id };
		todos.push(todo);
	}
	onSuccess({ todos, list });
};

export const getDidDocument = async ({ web5, did }) => {
	const resolution = await web5.did.resolve(did);
	const didDocument = resolution.didDocument;
	// console.log("didDocument", didDocument);
	return didDocument;
};

export const retrieveLists = async ({
	web5,
	did,
	protocolDefinition,
	onSuccess,
}: any) => {
	const schema = protocolDefinition.types.list.schema;
	const { records } = await web5.dwn.records.query({
		from: did,
		message: {
			filter: {
				schema,
			},
			dateSort: "createdAscending",
		},
	});
	const lists = [];
	for (let record of records) {
		const data = await record.data.json();
		const list = { record, data, id: record.id };
		lists.push(list);
	}

	onSuccess({ lists });
};

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
