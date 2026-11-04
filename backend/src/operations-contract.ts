const security = [{ bearerAuth: [] }];
const id = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", pattern: "^[1-9][0-9]*$" },
};
const query = [
  "status",
  "paymentStatus",
  "consumerId",
  "apiId",
  "page",
  "pageSize",
].map((name) => ({ name, in: "query", schema: { type: "string" } }));
const op = (summary: string, parameters: object[] = [], write = false) => ({
  summary,
  tags: ["Admin operations"],
  security,
  parameters,
  ...(write
    ? {
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["reason"],
                properties: {
                  reason: { type: "string", minLength: 1, maxLength: 2000 },
                },
              },
            },
          },
        },
      }
    : {}),
  responses: {
    "200": { description: "Successful operation; data envelope" },
    "400": { description: "Invalid fields" },
    "401": { description: "JWT required" },
    "403": { description: "Admin role required" },
    "404": { description: "Resource not found" },
    "409": { description: "Invalid transition" },
  },
});
export const operationsPaths = {
  "/api/admin/operations": {
    get: op("Live dependency checks and durable worker heartbeat"),
  },
  "/api/admin/subscriptions": { get: op("List/filter subscriptions", query) },
  "/api/admin/payments": {
    get: op(
      "List/filter sandbox payment ledger without checkout secrets",
      query,
    ),
  },
  "/api/admin/subscriptions/{id}/keys": {
    get: op("List associated API key metadata; never plaintext or hashes", [
      id,
    ]),
  },
  "/api/admin/subscriptions/{id}/suspend": {
    post: op(
      "Immediately suspend entitlement and record audit atomically",
      [id],
      true,
    ),
  },
  "/api/admin/subscriptions/{id}/restore": {
    post: op(
      "Restore a suspended subscription. A period that has already ended becomes Expired; otherwise Active. Quota is unchanged",
      [id],
      true,
    ),
  },
  "/api/admin/api-keys/{id}/revoke": {
    post: op(
      "Immediately revoke API key and record audit atomically",
      [id],
      true,
    ),
  },
};
