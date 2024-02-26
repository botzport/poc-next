import { Web5 } from "@web5/api";

export const createListRecord = ({
	web5,
	did,
	protocolDefinition,
}: {
	web5: Web5;
	did: string;
	protocolDefinition: any;
}) => {
	const dataFormat = protocolDefinition.types.list.dataFormats[0];
	const protocol = protocolDefinition.protocol;
	const schema = protocolDefinition.types.list.schema;

	return async ({ newListData, recipientDID, onSuccess }) => {
		try {
			const { record } = await web5.dwn.records.create({
				data: newListData,
				message: {
					protocol,
					protocolPath: "list",
					schema,
					dataFormat,
					recipient: recipientDID,
				},
			});

			if (!record) {
				console.error("Error creating record for new list");
				return;
			}

			// always send to self because we want the the remote datastore as source of truth
			// for both sender and recipient
			const { status: sendToSelfStatus } = await record.send(did);
			console.log("Sending this list to self", sendToSelfStatus);

			const data = await record.data.json();

			const list = {
				record,
				data,
				id: record.id,
			};

			if (recipientDID) {
				console.log("Sending this list record to recipient", record);
				const { status: sendStatus } = await record.send(recipientDID);

				if (sendStatus.code !== 202) {
					console.error(
						`Unable to send to target did ${JSON.stringify(sendStatus)}`,
					);
					return;
				} else {
					// success case
					console.log("Shared list sent to recipient", recipientDID);
				}
			}

			onSuccess({ list });
		} catch (e) {
			console.error("Error creating record", e);
		}
	};
};

export const retrieveLists = async ({
	web5,
	did,
	protocolDefinition,
	onSuccess,
}: any) => {
	const schema = protocolDefinition.types.list.schema;
	const { records } = await web5.dwn.records.query({
		from: did,
		message: {
			filter: {
				schema,
			},
			dateSort: "createdAscending",
		},
	});
	const lists = [];
	for (let record of records) {
		const data = await record.data.json();
		const list = { record, data, id: record.id };
		lists.push(list);
	}

	onSuccess({ lists });
};
