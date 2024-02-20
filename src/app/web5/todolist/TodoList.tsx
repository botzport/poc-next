"use client";

import { useCallback, useEffect, useState } from "react";
import { Web5 } from "@web5/api";
import {
	Checkbox,
	Stack,
	IconButton,
	Box,
	Input,
	StackDivider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { ActionableItem } from "@/app/shared/ActionableItem";

// This schema actually doesn't matter at all for this app
// For a real app, we would want to define our own schema
// and host it somewhere like S3, google cloud storage, or github
const TODO_SCHEMA = "https://schema.org/ToDo";

interface Todo {
	record: any;
	data: {
		completed: boolean;
		description: string;
	};
	id: string;
}

const initDWN = async ({ onSuccess }) => {
	const { web5, did } = await Web5.connect();
	if (web5 && did) {
		console.log("....connected to DWN", { web5, did }); // ion did method
		onSuccess({ web5, did });
		return;
	}
	console.error("Failed to connect to DWN");
};

const createRecord =
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

const deleteRecord =
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

const updateRecord =
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

const populateTodos = async ({ web5, onSuccess }) => {
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

export const TodoList = () => {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [newTodoDesc, setNewTodoDesc] = useState("");
	const [did, setDid] = useState(null);
	const [web5, setWeb5] = useState(null);

	useEffect(() => {
		// create DID and Web5 instance
		initDWN({
			onSuccess: ({ web5, did }) => {
				setWeb5(web5);
				setDid(did);
				// get todos from DWN
				populateTodos({
					web5,
					onSuccess: ({ todos }) => {
						console.log("....got todos from DWN", todos);
						setTodos(todos);
					},
				});
			},
		});
	}, []);

	const handleAddTodo = useCallback(() => {
		const newTodoData = {
			completed: false,
			description: newTodoDesc,
		};
		// create the record in DWN
		createRecord(web5)({
			newTodoData,
			onSuccess: ({ todo }: { todo: Todo }) => {
				console.log("....added todo to DWN", todo);
				setTodos([...todos, todo]);
				setNewTodoDesc("");
			},
		});
	}, [newTodoDesc, web5, todos]);

	const handleNewTodoChange = (event) => setNewTodoDesc(event.target.value);

	const handleDeleteTodo = useCallback(
		({ recordId }) => {
			// delete the record in DWN
			deleteRecord(web5)({
				recordId,
				onSuccess: () => {
					setTodos(todos.filter(({ id }) => id !== recordId));
					console.log(`....deleted todo ${recordId} from DWN`);
				},
			});
		},
		[web5, todos],
	);

	const handleToggleTodo = useCallback(
		({ recordId, todoData }) =>
			(e) => {
				const updatedTodoData = { ...todoData, completed: e.target.checked };
				console.log("....updated todo", updatedTodoData);
				updateRecord(web5)({
					recordId,
					updatedTodoData,
					onSuccess: () => {
						setTodos(
							todos.map((todo) => {
								if (todo.id === recordId) {
									return { ...todo, data: updatedTodoData };
								}
								return todo;
							}),
						);
						console.log(`....updated todo ${recordId} in DWN`);
					},
				});
			},
		[web5, todos],
	);

	return (
		<>
			<ActionableItem
				itemComponent={
					<Input
						placeholder="a new todo"
						value={newTodoDesc}
						onChange={handleNewTodoChange}
					/>
				}
				actionComp={
					<IconButton
						aria-label="delete"
						size="sm"
						colorScheme="blue"
						icon={<AddIcon />}
						onClick={handleAddTodo}
					/>
				}
			/>
			<Box mb={10} />
			<Stack
				direction="column"
				divider={<StackDivider />}
				boxShadow="0 0 30px 0 rgba(0, 0, 0, 0.04)"
				border="1px solid #E8E8E8"
				borderRadius="5px"
				spacing={0}
				m="20px"
			>
				{todos.map(({ data, id }) => (
					<ActionableItem
						key={id}
						itemComponent={
							<Checkbox
								size="lg"
								colorScheme="green"
								isChecked={data.completed}
								onChange={handleToggleTodo({ todoData: data, recordId: id })}
							>
								{data.description}
							</Checkbox>
						}
						actionComp={
							<IconButton
								aria-label="delete"
								size="sm"
								colorScheme="red"
								icon={<DeleteIcon />}
								onClick={() => handleDeleteTodo({ recordId: id })}
							/>
						}
					/>
				))}
			</Stack>
		</>
	);
};
