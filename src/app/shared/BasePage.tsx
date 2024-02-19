import { Box, Center, Container, Text } from "@chakra-ui/react";

// `app/page.tsx` is the UI for the `/` URL

export const BasePage = ({ children, title }) => {
	return (
		<Container mt={20}>
			<Center>
				<Text as="b" fontSize="1.5rem">
					{title}
				</Text>
			</Center>
			<Box h={10} />
			{children}
		</Container>
	);
};
