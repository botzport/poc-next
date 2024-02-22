import { NewListCreator } from "./NewListCreator";
import { List, useLists } from "../providers/ListsProvider";
import { ActionableItem } from "@/app/shared/ActionableItem";
import { Button, Stack, StackDivider, Text } from "@chakra-ui/react";

export const Lists = () => {
	const { lists, createList } = useLists();
	return (
		<>
			<NewListCreator createList={createList} />
			<Stack
				direction="column"
				divider={<StackDivider />}
				boxShadow="0 0 30px 0 rgba(0, 0, 0, 0.04)"
				border="1px solid #E8E8E8"
				borderRadius="5px"
				spacing={0}
				m="20px"
			>
				{lists.map(({ data, id }: List) => {
					return (
						<ActionableItem
							key={id}
							itemComponent={
								<>
									<Text>Title: {data.title}</Text>
									<Text>Description: {data.description}</Text>
									{data.recipient && <Text>Shared with: {data.recipient}</Text>}
								</>
							}
							actionComp={
								<Button
									onClick={() => {
										console.log("open list", id);
									}}
								>
									Open
								</Button>
							}
						/>
					);
				})}
			</Stack>
		</>
	);
};
