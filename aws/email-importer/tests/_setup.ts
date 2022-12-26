import fs from "fs";
import path from "path";

import cleanup from "./_cleanup";

const serviceAccount = fs.readFileSync(
	path.resolve(__dirname, "fixtures/fake-firebase-account.json"),
	"utf8",
);
const serviceAccountObj = JSON.parse(serviceAccount);

beforeEach(async () => {
	process.env.S3_BUCKET = "test";
	process.env.SERVICE_ACCOUNT = serviceAccount;
});

afterEach(async () => {
	await cleanup(serviceAccountObj.project_id);
});
