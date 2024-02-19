"use client";

import { useEffect, useState } from "react";
import { Web5 } from "@web5/api";
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Text,
	Checkbox,
	Stack,
} from "@chakra-ui/react";

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

export const TodoList = () => {
	const [did, setDid] = useState(null);
	const [web5, setWeb5] = useState(null);
	const [todos, setTodos] = useState([]);

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
		<Stack spacing={[1, 5]} direction={"column"}>
			<Checkbox size="lg" colorScheme="red" isChecked={true}>
				Checkbox
			</Checkbox>
			<Checkbox size="md" colorScheme="green" defaultChecked>
				Checkbox
			</Checkbox>
			<Checkbox size="lg" colorScheme="orange" defaultChecked>
				Checkbox
			</Checkbox>
		</Stack>
	);
};
