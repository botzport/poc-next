"use client";

import { useCallback, useState } from "react";
import {
	Checkbox,
	Stack,
	IconButton,
	Box,
	Input,
	StackDivider,
	Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { ActionableItem } from "@/app/shared/ActionableItem";
import { useList } from "../providers/ListProvider";

export const List = () => {
	const [newTodoDesc, setNewTodoDesc] = useState("");

	// TODO: EP-44 we are exposing the isReadOnly state to prevent the recipient from making any update and deletes to the records
	// because all CRUD operations are done on both author's and recipient's lists. Recipients cannot affect the author's list
	// for some reason. There will be a research spike later to understand why this is happening.
	const { todos, isReadOnly, createTodo, deleteTodo, updateTodo } = useList();
	const handleNewTodoChange = (event) => setNewTodoDesc(event.target.value);

	const handleAddTodo = useCallback(() => {
		const newTodoInput = {
			completed: false,
			description: newTodoDesc,
		};
		createTodo({
			newTodoInput,
			onSuccess: () => {
				setNewTodoDesc("");
			},
		});
	}, [newTodoDesc, createTodo]);

	const handleDeleteTodo = useCallback(
		({ recordId }) => {
			deleteTodo({
				recordId,
				onSuccess: () => {},
			});
		},
		[deleteTodo],
	);

	const handleToggleTodo = useCallback(
		({ recordId, todoData }) =>
			(e) => {
				const updatedTodoData = { ...todoData, completed: e.target.checked };
				updateTodo({ recordId, updatedTodoData, onSuccess: () => {} });
			},
		[updateTodo],
	);

	return (
		<>
			{isReadOnly && (
				<Text>
					Only the author of this list can edit this list. You are not the
					author but the author has granted you permission to view the latest
					todos from this list.
				</Text>
			)}
			<ActionableItem
				itemComponent={
					<Input
						placeholder="a new todo"
						value={newTodoDesc}
						onChange={handleNewTodoChange}
						disabled={isReadOnly}
					/>
				}
				actionComp={
					<IconButton
						aria-label="delete"
						size="sm"
						colorScheme="blue"
						icon={<AddIcon />}
						onClick={handleAddTodo}
						isDisabled={isReadOnly}
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
								disabled={isReadOnly}
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
								isDisabled={isReadOnly}
							/>
						}
					/>
				))}
			</Stack>
		</>
	);
};
