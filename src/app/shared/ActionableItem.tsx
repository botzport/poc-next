import { HStack, Box } from "@chakra-ui/react";

export const ActionableItem = ({ itemComponent, actionComp }) => {
	return (
		<HStack justifyContent={"space-between"} bg="white" p="16px 24px">
			<Box width="95%">{itemComponent}</Box>
			<Box>{actionComp}</Box>
		</HStack>
	);
};
