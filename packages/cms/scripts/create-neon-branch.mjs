import { readFileSync, writeFileSync } from "node:fs";

const devVars = readFileSync("apps/rimelight.com/.dev.vars", "utf8");
let apiKey = "";
for (const line of devVars.split("\n")) {
  if (line.startsWith("NEON_API_KEY=")) {
    apiKey = line.split("=")[1].trim();
  }
}

const projectId = "empty-pine-44671516";
const branchName = "cms-v2-dev-test";

console.log(`Checking existing branches on project ${projectId}...`);
const listRes = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/branches`, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  },
});
const listData = await listRes.json();
let targetBranch = listData.branches?.find((b) => b.name === branchName);

if (!targetBranch) {
  console.log(`Creating branch '${branchName}' from main...`);
  const createRes = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/branches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      branch: {
        name: branchName,
      },
    }),
  });
  const createData = await createRes.json();
  targetBranch = createData.branch;
  console.log("Branch created:", targetBranch?.id, targetBranch?.name);
} else {
  console.log("Branch already exists:", targetBranch.id, targetBranch.name);
}

// Get connection URI for this branch
const endpointsRes = await fetch(
  `https://console.neon.tech/api/v2/projects/${projectId}/endpoints`,
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  },
);
const endpointsData = await endpointsRes.json();
const branchEndpoint = endpointsData.endpoints?.find((e) => e.branch_id === targetBranch.id);
console.log("Branch endpoint host:", branchEndpoint?.host);

// Read current user password / role to construct connection string
const connRes = await fetch(
  `https://console.neon.tech/api/v2/projects/${projectId}/connection_uri?branch_id=${targetBranch.id}`,
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  },
);
const connData = await connRes.json();
console.log("Branch connection URI obtained successfully:", Boolean(connData.uri));

writeFileSync(
  "C:/Users/idant/.gemini/antigravity/brain/3c75fdb0-e279-4da4-bb9a-c0d1bda65971/scratch/branch-info.json",
  JSON.stringify({ branch: targetBranch, endpoint: branchEndpoint, uri: connData.uri }, null, 2),
);
