import { ActionableItem } from "@/app/shared/ActionableItem";
import { CopyIcon } from "@chakra-ui/icons";
import { Box, IconButton, Text, useToast } from "@chakra-ui/react";
import { useTodoListManager } from "./TodoDwnProvider";
import copy from "copy-to-clipboard";

export const DIDViewer = () => {
	const { did } = useTodoListManager();
	const toast = useToast();

	const handleCopy = () => {
		copy(did);
		toast({
			position: "top-right",
			render: () => (
				<Box color="black" padding="12px 16px" borderRadius={5} bg="#CEE7DE">
					Copied
				</Box>
			),
		});
	};
	return (
		<ActionableItem
			itemComponent={<Text isTruncated>{did}</Text>}
			actionComp={
				<IconButton
					aria-label="delete"
					size="sm"
					colorScheme="gray"
					icon={<CopyIcon />}
					onClick={handleCopy}
				/>
			}
		/>
	);
};
