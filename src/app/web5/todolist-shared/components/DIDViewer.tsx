import copy from "copy-to-clipboard";
import { ActionableItem } from "@/app/shared/ActionableItem";
import { CopyIcon, InfoIcon } from "@chakra-ui/icons";
import {
	Box,
	IconButton,
	LinkBox,
	Stack,
	StackDivider,
	Text,
	useToast,
} from "@chakra-ui/react";
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
		<Box
			boxShadow="0 0 30px 0 rgba(0, 0, 0, 0.04)"
			border="1px solid #E8E8E8"
			p="20px"
		>
			<Text as="b">Your DID</Text>
			<Box ml={2}>
				<InfoIcon color="green.200" /> Share your DID with other people so they
				can send you their todo lists:
			</Box>

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
		</Box>
	);
};
