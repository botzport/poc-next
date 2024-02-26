import { Web5 } from "@web5/api";
import { ListData } from "../ListsProvider";

// for a shared todo list, if I created the list, then the recipient of the todo is always me (my todo)
// if someone else created the list, the recipient is always them (their todo)
export const getTodoRecipients = ({
	did,
	list,
}: {
	did: string;
	list: ListData | undefined;
}): string[] => {
	const res = new Set<string>();

	res.add(did);
	res.add(list?.author ?? did);
	res.add(list?.recipient ?? did);

	return Array.from(res);
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

	return async ({
		newTodoData,
		recipients,
		onSuccess,
	}: {
		newTodoData: any;
		recipients: string[];
		onSuccess: any;
	}) => {
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
				// TODO: EP-44 if the list recipient tries to add a todo to the list, the call to
				// `web5.dwn.records.create` will fail to create a record
				console.error("Error creating record for new todo");
				return;
			}

			const data = await record.data.json();

			const todo = {
				record,
				data,
				id: record.id,
			};

			await Promise.all(recipients.map((r) => record.send(r))).then((resp) => {
				console.log("Sent this todo to recipients", resp);
			});

			onSuccess({ todo });
		} catch (e) {
			console.error("Error creating todo record", e);
		}
	};
};

export const genDeleteTodoRecord =
	({ web5, did }: { web5: Web5; did: string }) =>
	async ({
		recordId,
		recipients,
		onSuccess,
	}: {
		recordId: string;
		recipients: string[];
		onSuccess: any;
	}) => {
		await Promise.all(
			recipients.map((r) =>
				web5.dwn.records.delete({
					from: r,
					message: {
						recordId,
					},
				}),
			),
		).then((resp) => {
			// TODO: EP-44 We will get `ProtocolAuthorizationActionNotAllowed: inbound message action not allowed for author`
			// when performing the delete operation on a DWN that does not belong to the current user's DID
			// Do we just want to send an update to the other person's DWN with the tombstone
			// and the other person can see it and decide if that record should be deleted?
			console.log("Deleted this todo from recipients", resp);
		});

		onSuccess();
	};

export const genUpdateTodoRecord =
	({ web5, did }: { web5: Web5; did: string }) =>
	async ({
		recordId,
		recipients,
		updatedTodoData,
		onSuccess,
	}: {
		recordId: string;
		recipients: string[];
		updatedTodoData: any;
		onSuccess: any;
	}) => {
		// Get the record in DWN
		const { record } = await web5.dwn.records.read({
			from: did,
			message: {
				filter: {
					recordId,
				},
			},
		});

		if (!record) {
			console.error("Error querying todo record");
			return;
		}

		// Update the record in DWN
		await record.update({ data: updatedTodoData });

		await Promise.all(recipients.map((r) => record.send(r))).then((resp) => {
			// TODO: EP-44 if the list recipient tries to update the todos from the list and send the updated record
			// to the author, the author send attempt will fail with
			// `ProtocolAuthorizationActionNotAllowed: inbound message action not allowed for author`
			// Is this due to the protocol configuration?
			console.log("Sent this todo to recipients", resp);
		});

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

		// TODO: EP-43 create issue in web5 api repo:
		// why is `read` not finding that record and returning 404?
		if (!listRecord) {
			console.error("Error reading list record", readListStatus);
		}

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
