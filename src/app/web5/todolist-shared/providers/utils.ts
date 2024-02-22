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

export const createTodoRecord = ({ web5, protocolDefinition }) => {
	const dataFormat = protocolDefinition.types.todo.dataFormats[0];
	const protocol = protocolDefinition.protocol;
	const schema = protocolDefinition.types.todo.schema;

	return async ({ newTodoData, onSuccess }) => {
		try {
			const { record } = await web5.dwn.records.create({
				data: newTodoData,
				message: {
					// protocol,
					// protocolPath: "todo",
					schema,
					dataFormat,
				},
			});

			const data = await record.data.json();

			const todo = {
				record,
				data,
				id: record.id,
			};
			onSuccess({ todo });
		} catch (e) {
			console.error("Error creating todo record", e);
		}
	};
};

export const createListRecord = ({ web5, protocolDefinition }) => {
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

			const data = await record.data.json();

			const list = {
				record,
				data,
				id: record.id,
			};

			if (recipientDID) {
				const { status: sendStatus } = await record.send(recipientDID);

				if (sendStatus.code !== 202) {
					console.error(
						`Unable to send to target did ${JSON.stringify(sendStatus)}`,
					);
					return;
				} else {
					console.log("Shared list sent to recipient");
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

export const retrieveTodos = async ({
	web5,
	protocolDefinition,
	onSuccess,
}: any) => {
	const schema = protocolDefinition.types.todo.schema;
	const { records } = await web5.dwn.records.query({
		message: {
			filter: {
				schema: schema,
			},
			dateSort: "createdAscending",
		},
	});
	const todos = [];
	for (let record of records) {
		const data = await record.data.json();
		const todo = { record, data, id: record.id };
		todos.push(todo);
	}
	onSuccess({ todos });
};

export const retrieveLists = async ({
	web5,
	protocolDefinition,
	onSuccess,
}: any) => {
	const schema = protocolDefinition.types.list.schema;
	const { records } = await web5.dwn.records.query({
		message: {
			filter: {
				schema: schema,
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

export const createSharedList =
	({ web5, protocolDefinition }) =>
	async ({ title, description, author, recipient, onSuccess }) => {
		const dataFormat = protocolDefinition.types.list.dataFormats[0];
		const protocol = protocolDefinition.protocol;
		const schema = protocolDefinition.types.list.schema;

		const sharedListData = {
			"@type": "list",
			title,
			description,
			author,
			recipient,
		};

		try {
			// NOTE: this will fail if recipientDID is invalid.
			// We will get the TypeError: cannot read record.data
			// Error handling and error checking is not implemented
			const { record } = await web5.dwn.records.create({
				data: sharedListData,
				message: {
					protocol,
					protocolPath: "list",
					schema,
					dataFormat,
					recipient,
				},
			});

			const data = await record.data.json();

			const sharedList = {
				record,
				data,
				id: record.id,
			};

			const { status: sendStatus } = await record.send(recipient);

			if (sendStatus.code !== 202) {
				console.log("Unable to send to target did:" + sendStatus);
				return;
			} else {
				console.log("Shared list sent to recipient");
			}
			onSuccess({ sharedList });
		} catch (e) {
			console.error("Error creating shared list", e);
		}
	};

// checks if the protocol is installed and installs it if it isn't
export const configureProtocol = async ({ web5, protocolDefinition }) => {
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

	console.log("Protocol configured", configureStatus, protocol);
};
