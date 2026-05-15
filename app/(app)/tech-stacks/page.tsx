import { getTechStacksData } from "@/lib/tech-stacks-data";
import { TechStacksClient } from "@/components/tech-stacks/TechStacksClient";

export const dynamic = "force-dynamic";

export default async function TechStacksPage() {
  const stacks = await getTechStacksData();

  return <TechStacksClient stacks={stacks} />;
}
