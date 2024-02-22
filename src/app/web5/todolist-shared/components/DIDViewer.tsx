import copy from "copy-to-clipboard";
import { ActionableItem } from "@/app/shared/ActionableItem";
import { CopyIcon } from "@chakra-ui/icons";
import { Box, IconButton, Text, useToast } from "@chakra-ui/react";
import { useWeb5 } from "../providers/Web5Provider";

export const DIDViewer = () => {
	const { did } = useWeb5();
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
