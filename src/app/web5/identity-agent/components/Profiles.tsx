import { ActionableItem } from "@/app/shared/ActionableItem";
import { BasePage } from "@/app/shared/BasePage";
import { AddIcon } from "@chakra-ui/icons";
import {
	Box,
	Heading,
	IconButton,
	Input,
	StackDivider,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useAgent } from "../providers/AgentProvider";

export const Profiles = () => {
	const [newName, setNewName] = useState("");

	const { addIdentity, identities } = useAgent();
	console.log("identities", identities);
	const handleCreateNewIdentity = useCallback(() => {
		console.log("creating new did with the name", newName);
		addIdentity({ name: newName });
	}, [newName, addIdentity]);

	return (
		<>
			<ActionableItem
				itemComponent={
					<Input
						placeholder="new DID name"
						value={newName}
						onChange={(event) => setNewName(event.target.value)}
					/>
				}
				actionComp={
					<IconButton
						aria-label="add"
						size="sm"
						colorScheme="blue"
						icon={<AddIcon />}
						onClick={handleCreateNewIdentity}
					/>
				}
			/>
			<VStack
				divider={<StackDivider borderColor="gray.200" />}
				spacing={4}
				align="stretch"
			>
				{identities.map((i) => (
					<Box key={i.did}>
						<Heading fontSize="m">{i.name}</Heading>
						<Text mt={4}>{i.did}</Text>
					</Box>
				))}
			</VStack>
		</>
	);
};
