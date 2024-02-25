import { Web5 } from "@web5/api";

// for a shared todo list, if I created the list, then the recipient of the todo is always me (my todo)
// if someone else created the list, the recipient is always them (their todo)
export const getTodoRecipient = ({
	did,
	list,
}: {
	did: string;
	list: { author: string; recipient: string };
}) => {
	if (did === list.author) {
		return list.recipient;
	} else {
		return list.author;
	}
};

export const genCreateTodoRecord = ({
	web5,
	did,
	protocolDefinition,
}: {
	web5: Web5;
	did: string;
	protocolDefinition: any;
}) => {
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

			if (!record) {
				console.error("Error creating record for new todo");
				return;
			}

			// always send to self because we want the the remote datastore as source of truth
			// for both sender and recipient
			const { status: sendToSelfStatus } = await record.send(did);
			console.log("Sending this todo to self", sendToSelfStatus);

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

export const genDeleteTodoRecord =
	({ web5, did }: { web5: Web5; did: string }) =>
	async ({ recordId, onSuccess }) => {
		// Delete the record in DWN
		await web5.dwn.records.delete({
			message: {
				recordId,
			},
		});

		onSuccess();
	};

export const genUpdateTodoRecord =
	({ web5, did }: { web5: Web5; did: string }) =>
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

export const genRetrieveTodoList =
	({ web5, did }: { web5: Web5; did: string }) =>
	async ({ listId, onSuccess }: { listId: string; onSuccess: any }) => {
		// fetch shared list details from remote datastore
		const { record: listRecord, status: readListStatus } =
			await web5.dwn.records.read({
				from: did,
				message: {
					filter: {
						recordId: listId,
					},
				},
			});
		const { records: listRecords, status: queryListStatus } =
			await web5.dwn.records.query({
				from: did,
				message: {
					filter: {
						recordId: listId,
					},
				},
			});

		// TODO: why is `read` not finding that record?
		if (!listRecord) {
			console.error("Error reading list record", readListStatus);
			// return;
		}

		// const list = await listRecord.data.json();
		// if (!list) {
		// 	console.error("Error reading list data");
		// 	return;
		// }

		if (!listRecords || listRecords.length < 1) {
			console.error("Error querying list record", queryListStatus);
			return;
		}

		const list = await listRecords[0].data.json();

		// fetch todos under list
		const { records: todoRecords = [] } = await web5.dwn.records.query({
			from: did,
			message: {
				filter: {
					parentId: listId,
				},
				dateSort: "createdAscending",
			},
		});

		// add entry to array

		const todos = [];
		for (let record of todoRecords) {
			const data = await record.data.json();
			const todo = { record, data, id: record.id };
			todos.push(todo);
		}
		onSuccess({ todos, list });
	};
