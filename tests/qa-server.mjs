import { startQA } from "./qa-fixtures.mjs";
const qa = await startQA(5001);
console.log(
  `QA API ready at ${qa.base}; database is isolated from production.`,
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, async () => {
    await qa.stop();
    process.exit(0);
  });
