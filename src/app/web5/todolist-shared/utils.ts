import { Web5 } from "@web5/api";
import { TODO_SCHEMA } from "./constants";

export const initDWN = async ({ onSuccess }) => {
	const { web5, did } = await Web5.connect();
	if (web5 && did) {
		onSuccess({ web5, did });
		return;
	}
	console.error("Failed to connect to DWN");
};

export const createRecord =
	({ web5, protocolDefinition }) => {
		const dataFormat = protocolDefinition.types.list.dataFormats[0]
		const protocol = protocolDefinition.protocol
		const schema = protocolDefinition.types.list.schema
		debugger
		return async ({ newTodoData, recipientDID, onSuccess }) => {
			try {
				const { record } = await web5.dwn.records.create({
					data: newTodoData,
					message: {
						protocol,
						protocolPath: "list",
						schema,
						dataFormat,
						recipient: recipientDID
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
				console.error("Error creating record", e);
			}
		}
	}

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

export const populateTodos = async ({ web5, onSuccess }) => {
	const { records } = await web5.dwn.records.query({
		message: {
			filter: {
				schema: TODO_SCHEMA, // replace with own schema
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
