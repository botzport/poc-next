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
import { useWeb5 } from "./TodoDwnProvider";

export const SharedTodoList = () => {
	const [newTodoDesc, setNewTodoDesc] = useState("");

	const { todos, addTodo, deleteTodo, updateTodo } = useWeb5();
	const handleNewTodoChange = (event) => setNewTodoDesc(event.target.value);

	const handleAddTodo = useCallback(() => {
		const newTodoData = {
			completed: false,
			description: newTodoDesc,
		};
		addTodo({
			newTodoData,
			onSuccess: () => {
				setNewTodoDesc("");
			},
		});
	}, [newTodoDesc, addTodo]);

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
