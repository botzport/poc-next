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
	(web5) =>
	async ({ newTodoData, onSuccess }) => {
		const { record } = await web5.dwn.records.create({
			data: newTodoData,
			message: {
				schema: TODO_SCHEMA,
				dataFormat: "application/json",
			},
		});

		const data = await record.data.json();

		const todo = {
			record,
			data,
			id: record.id,
		};
		onSuccess({ todo });
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
