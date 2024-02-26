import { promises as fs } from "fs";

export async function GET() {
	const path = __dirname.replace(".next/server", "src") + "/protocol.json"; //.next/server is the path to the build folder that is created when you run next command
	const fileBuffer = await fs.readFile(path);
	const json = JSON.parse(fileBuffer.toString());
	return Response.json(json);
}
