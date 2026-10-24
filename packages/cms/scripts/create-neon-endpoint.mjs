import { readFileSync, writeFileSync } from "node:fs";

const devVars = readFileSync("apps/rimelight.com/.dev.vars", "utf8");
let apiKey = "";
for (const line of devVars.split("\n")) {
  if (line.startsWith("NEON_API_KEY=")) {
    apiKey = line.split("=")[1].trim();
  }
}

const projectId = "empty-pine-44671516";
const branchId = "br-super-tree-abtxgztm";

// Neon requires creating a compute endpoint for a branch to connect to it
console.log("Checking endpoints...");
const epListRes = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/endpoints`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const epData = await epListRes.json();
let endpoint = epData.endpoints?.find((e) => e.branch_id === branchId);

if (!endpoint) {
  console.log("Creating compute endpoint for branch...");
  const createEpRes = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/endpoints`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: {
          branch_id: branchId,
          type: "read_write",
        },
      }),
    },
  );
  const res = await createEpRes.json();
  endpoint = res.endpoint;
  console.log("Created endpoint:", endpoint?.id, endpoint?.host);
} else {
  console.log("Found endpoint:", endpoint.id, endpoint.host);
}

// Get database password / connection URI
// We can use the existing role and database name from main
const rolesRes = await fetch(
  `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/roles`,
  {
    headers: { Authorization: `Bearer ${apiKey}` },
  },
);
const rolesData = await rolesRes.json();
const roleName = rolesData.roles?.[0]?.name || "neondb_owner";

const connRes = await fetch(
  `https://console.neon.tech/api/v2/projects/${projectId}/connection_uri?branch_id=${branchId}&role_name=${roleName}&database_name=neondb`,
  {
    headers: { Authorization: `Bearer ${apiKey}` },
  },
);
const connData = await connRes.json();
console.log(
  "Branch connection URI:",
  connData.uri ? connData.uri.replace(/:[^:@]+@/, ":****@") : "none",
);

if (connData.uri) {
  writeFileSync(
    "C:/Users/idant/.gemini/antigravity/brain/3c75fdb0-e279-4da4-bb9a-c0d1bda65971/scratch/branch-uri.txt",
    connData.uri,
  );
}
