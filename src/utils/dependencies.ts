// @ts-expect-error Arborist unfortunately does not expose any TS typings..
// See https://www.npmjs.com/package/@npmcli/arborist for docs.
import Arborist from "@npmcli/arborist";
import axios from "axios";

const BULK_ADVISORY_API =
  "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk";

type ArboristNode = {
  name: string;
  version: string;
  location: string;
  path: string;
  resolved: string;
  dev: boolean;
  edgesIn?: unknown;
};
type ArboristTree = {
  name: string;
  version: string;
  path: string;
  children: Map<string, ArboristNode>;
};

type BulkAdvisoryRequest = Record<string, string[]>;
type BulkAdvisoryResponse = Record<
  string,
  {
    id: number;
    url: string;
    title: string;
    severity: "low" | "moderate" | "high" | "critical";
    vulnerable_versions: string;
  }
>;

export async function fetchMetaVulnerabilieties(): Promise<BulkAdvisoryResponse> {
  const arb = new Arborist();
  const tree: ArboristTree = await arb.loadActual();

  const bulkRequest = convertTreeToBulkRequest(tree);
  const advisoriesResponse = await axios.post<BulkAdvisoryResponse>(
    BULK_ADVISORY_API,
    bulkRequest
  );

  return advisoriesResponse.data;
}

function convertTreeToBulkRequest(tree: ArboristTree): BulkAdvisoryRequest {
  const request: BulkAdvisoryRequest = {};

  tree.children.forEach((node, key) => {
    if (Array.isArray(request[key])) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      request[key]!.push(node.version);
    } else {
      request[key] = [node.version];
    }
  });

  return request;
}

// fetchMetaVulnerabilieties().then(console.log);
