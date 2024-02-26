export async function getData({ onSuccess }) {
	const res = await fetch("http://localhost:3000/api/todolist-shared", {
		cache: "no-cache",
	});
	// The return value is *not* serialized
	// You can return Date, Map, Set, etc.

	if (!res.ok) {
		// This will activate the closest `error.js` Error Boundary
		throw new Error(`Failed to fetch data ${JSON.stringify(res)}`);
	}
	const resp = await res.json();
	onSuccess(resp);
	return resp;
}
