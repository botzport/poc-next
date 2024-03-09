"use client";

import { Link, StackDivider, VStack } from "@chakra-ui/react";
import { BasePage } from "./shared/BasePage";

// `app/page.tsx` is the UI for the `/` URL

const ROUTES = ["web5/todolist", "web5/todolist-shared", "web5/identity-agent"];

export default function Page() {
	return (
		<BasePage title="Web5 POCs">
			<VStack
				divider={<StackDivider borderColor="gray.200" />}
				spacing={4}
				align="stretch"
			>
				{ROUTES.map((route) => (
					<Link href={route} key={route}>
						{route}
					</Link>
				))}
			</VStack>
		</BasePage>
	);
}
