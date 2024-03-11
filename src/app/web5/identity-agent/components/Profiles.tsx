import { ActionableItem } from "@/app/shared/ActionableItem";
import { useRouter, usePathname } from "next/navigation";
import { AddIcon, DownloadIcon, ViewIcon } from "@chakra-ui/icons";
import {
	Box,
	HStack,
	Heading,
	IconButton,
	Input,
	StackDivider,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useAgent } from "../providers/AgentProvider";
import { getDidDocument } from "../providers/AgentProvider/utils";

export const Profiles = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [newName, setNewName] = useState("");

	const { addIdentity, keyManager, identities } = useAgent();

	const handleCreateNewIdentity = useCallback(() => {
		console.log("creating new did with the name", newName);
		addIdentity({ name: newName, onSuccess: () => setNewName("") });
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
					<ActionableItem
						key={i.did}
						itemComponent={
							<Box w="85%">
								<Heading fontSize="m">{i.name}</Heading>
								<Text maxW="100%" isTruncated mt={4}>
									{i.did}
								</Text>
							</Box>
						}
						actionComp={
							<HStack ml="-60px">
								<IconButton
									aria-label="view"
									size="sm"
									icon={<ViewIcon />}
									onClick={() => {
										// call a util function to retrieve DidDocument
										getDidDocument({ did: i.did });

										// router.push(`${pathname}/${i.did}`);
									}}
								/>
								<IconButton
									aria-label="download"
									size="sm"
									icon={<DownloadIcon />}
									onClick={async () => {
										console.log("keyUri", i.keyUri);
										const secretKey = await keyManager?.exportKey({
											keyUri: i.keyUri,
										});
										console.log("exporting secretKey", secretKey);
									}}
								/>
							</HStack>
						}
					/>
				))}
			</VStack>
		</>
	);
};
