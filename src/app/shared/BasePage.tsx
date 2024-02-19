import { Box, Center, Container, Text, VStack } from "@chakra-ui/react";

// `app/page.tsx` is the UI for the `/` URL

export const BasePage = ({
	children,
	title,
	description,
}: {
	children: React.ReactNode;
	title: string;
	description?: string;
}) => {
	return (
		<Container mt={20}>
			<VStack>
				<Container>
					<Center>
						<Text as="b" fontSize="1.5rem">
							{title}
						</Text>
					</Center>
				</Container>
				{description && (
					<Container>
						<Center>
							<Text fontSize="1rem">{description}</Text>
						</Center>
					</Container>
				)}
			</VStack>
			<Box h={10} />
			{children}
		</Container>
	);
};
