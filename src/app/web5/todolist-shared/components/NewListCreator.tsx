import { ActionableItem } from "@/app/shared/ActionableItem";
import { AddIcon } from "@chakra-ui/icons";
import { IconButton, Input, Text } from "@chakra-ui/react";
import { useState } from "react";

export const NewListCreator = ({ createList }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [recipient, setRecipient] = useState("");

	const handleTitleChange = (event) => setTitle(event.target.value);
	const handleDescriptionChange = (event) => setDescription(event.target.value);
	const handleRecipientChange = (event) => setRecipient(event.target.value);
	const handleCreateList = () => {
		const newListInput = {
			title,
			description,
			recipientDID: recipient.trim(),
		};

		createList({
			newListInput,
			onSuccess: () => {
				setTitle("");
				setDescription("");
				setRecipient("");
			},
		});
	};
	return (
		<>
			<ActionableItem
				itemComponent={
					<>
						<Text>Create New Todo List</Text>
						<Input
							placeholder="title"
							value={title}
							onChange={handleTitleChange}
						/>
						<Input
							placeholder="description"
							value={description}
							onChange={handleDescriptionChange}
						/>
						<Input
							placeholder="recipient"
							value={recipient}
							onChange={handleRecipientChange}
						/>
					</>
				}
				actionComp={
					<IconButton
						aria-label="delete"
						size="sm"
						colorScheme="blue"
						icon={<AddIcon />}
						onClick={handleCreateList}
					/>
				}
			/>
		</>
	);
};
