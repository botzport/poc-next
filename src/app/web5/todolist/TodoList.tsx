"use client";

import { useEffect, useState } from "react";
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

const initDWN = async ({ onSuccess }) => {
	const { web5, did } = await Web5.connect();
	if (web5 && did) {
		onSuccess({ web5, did });
		return;
	}
	console.error("Failed to connect to DWN");
};

const populateTodos = async ({ web5, setTodos }) => {
	const { records } = await web5.dwn.records.query({
		message: {
			filter: {
				schema: "https://schema.org/ToDo", // replace with own schema
			},
			dateSort: "createdAscending",
		},
	});
	console.log("....records", records);
};

const TEST_ITEMS = ["item 1", "item 2"];

export const TodoList = () => {
	const [did, setDid] = useState(null);
	const [web5, setWeb5] = useState(null);
	const [todos, setTodos] = useState(TEST_ITEMS);

	useEffect(() => {
		// create DID and Web5 instance
		initDWN({
			onSuccess: ({ web5, did }) => {
				setWeb5(web5);
				setDid(did);
				populateTodos({ web5, setTodos });
				// populate todos from DWN
			},
		});
	}, []);

	return (
		<>
			<ActionableItem
				itemComponent={<Input placeholder="a new todo" />}
				actionComp={
					<IconButton
						aria-label="delete"
						size="sm"
						colorScheme="blue"
						icon={<AddIcon />}
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
				{todos.map((todo, index) => (
					<ActionableItem
						key={index}
						itemComponent={
							<Checkbox size="lg" colorScheme="green">
								{todo}
							</Checkbox>
						}
						actionComp={
							<IconButton
								aria-label="delete"
								size="sm"
								colorScheme="red"
								icon={<DeleteIcon />}
							/>
						}
					/>
				))}
			</Stack>
		</>
	);
};
