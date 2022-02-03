import { execFile, spawnSync } from "child_process";
import path from "path";

import { Rule } from "eslint";

import { createCache } from "../utils/cache";
import { fetchMetaVulnerabilieties } from "../utils/dependencies";

const cache = createCache({ useFileSystem: true, scope: "dependencies" });

let isFetchingData = false;

export const dependenciesRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
  },
  create: createRule,
};

function createRule(context: Rule.RuleContext): Rule.RuleListener {
  return {
    ImportDeclaration: (node) => {
      const importValue = node.source.value?.toString();
      const isModule = importValue?.includes("/node_modules/");

      if (importValue && isModule) {
        const advisory = cache.get(importValue);

        if (!advisory) {
          // The following will have to been done on a different thread.. :(
          if (isFetchingData) {
            return;
          }

          fetchMetaVulnerabilieties().then((advisories) => {
            console.log("here?");
            for (const [name, advisory] of Object.entries(advisories)) {
              cache.set(name, advisory);
            }
          });

          isFetchingData = true;
        } else {
          context.report({ message: "Oh no", node });
        }
      }
      console.log(node.source.value);
    },
  };
}
