import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

function normalizeIdentifier(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase()
    .trim();
}

export async function upsert(
  collectionId: string,
  from: string,
  to: string,
  relationship: string,
  chunkId: string
) {
  const session = driver.session();

  const normalizedFrom = normalizeIdentifier(from);
  const normalizedTo = normalizeIdentifier(to);
  const relationshipType = normalizeIdentifier(relationship);

  const query = `
    MERGE (from:Node {name: $from, collectionId: $collectionId})
    ON CREATE SET from.chunkIds = [$chunkId]
    ON MATCH SET from.chunkIds = 
      CASE 
        WHEN $chunkId IN COALESCE(from.chunkIds, []) 
        THEN from.chunkIds 
        ELSE COALESCE(from.chunkIds, []) + [$chunkId] 
      END
    MERGE (to:Node {name: $to, collectionId: $collectionId})
    ON CREATE SET to.chunkIds = [$chunkId]
    ON MATCH SET to.chunkIds = 
      CASE 
        WHEN $chunkId IN COALESCE(to.chunkIds, []) 
        THEN to.chunkIds 
        ELSE COALESCE(to.chunkIds, []) + [$chunkId] 
      END
    MERGE (from)-[r:\`${relationshipType}\`]->(to)
    ON CREATE SET r.updatedAt = $timestamp, r.collectionId = $collectionId, r.chunkIds = [$chunkId]
    ON MATCH SET r.updatedAt = $timestamp, r.collectionId = $collectionId, r.chunkIds =
      CASE
        WHEN $chunkId IN COALESCE(r.chunkIds, [])
        THEN r.chunkIds
        ELSE COALESCE(r.chunkIds, []) + [$chunkId]
      END
    RETURN r
  `;

  await session.run(query, {
    collectionId,
    from: normalizedFrom,
    to: normalizedTo,
    chunkId,
    timestamp: Date.now(),
  });

  await session.close();
}

export async function getAllNodes(collectionId: string) {
  const session = driver.session();
  const query = `
    MATCH (n:Node {collectionId: $collectionId})
    RETURN n.name
  `;
  const result = await session.run(query, { collectionId });
  const nodes = result.records.map((record) => record.get("n.name"));
  await session.close();
  return nodes;
}

export async function getAllRelationships(
  collectionId: string
): Promise<string[]> {
  const session = driver.session();
  const query = `
    MATCH (n:Node {collectionId: $collectionId})-[r]->(m:Node {collectionId: $collectionId})
    WHERE r.collectionId = $collectionId
    RETURN DISTINCT type(r) as relationshipType
  `;
  const result = await session.run(query, { collectionId });
  const relationships = result.records.map((record) =>
    record.get("relationshipType")
  );
  await session.close();
  return relationships;
}

export async function getNodes(collectionId: string, names: string[]) {
  const session = driver.session();
  const normalizedNames = names.map((name) => normalizeIdentifier(name));
  const query = `
    MATCH (n:Node)
    WHERE n.collectionId = $collectionId AND n.name IN $names
    OPTIONAL MATCH (n)-[rOut]->(mOut:Node {collectionId: $collectionId})
    WHERE rOut.collectionId = $collectionId OR rOut IS NULL
    OPTIONAL MATCH (mIn:Node {collectionId: $collectionId})-[rIn]->(n)
    WHERE rIn.collectionId = $collectionId OR rIn IS NULL
    RETURN n.name as name,
           collect(DISTINCT {from: n.name, to: mOut.name, relationship: type(rOut)}) as outgoing,
           collect(DISTINCT {from: mIn.name, to: n.name, relationship: type(rIn)}) as incoming
  `;
  const result = await session.run(query, {
    collectionId,
    names: normalizedNames,
  });
  await session.close();
  return result.records.map((record) => {
    const name = record.get("name");
    const outgoing = record
      .get("outgoing")
      .filter(
        (rel: any) =>
          rel &&
          rel.from &&
          rel.to &&
          rel.relationship &&
          rel.relationship !== "NULL"
      );
    const incoming = record
      .get("incoming")
      .filter(
        (rel: any) =>
          rel &&
          rel.from &&
          rel.to &&
          rel.relationship &&
          rel.relationship !== "NULL"
      );
    return {
      name,
      outgoing,
      incoming,
    };
  });
}

export async function removeByChunk(collectionId: string, chunkId: string) {
  const session = driver.session();
  const deleteRelationshipQuery = `
    MATCH ()-[r]->()
    WHERE r.collectionId = $collectionId
      AND $chunkId IN COALESCE(r.chunkIds, [])
      AND size(COALESCE(r.chunkIds, [])) = 1
    DELETE r
  `;
  await session.run(deleteRelationshipQuery, { collectionId, chunkId });

  const removeRelationshipChunkQuery = `
    MATCH ()-[r]->()
    WHERE r.collectionId = $collectionId
      AND $chunkId IN COALESCE(r.chunkIds, [])
      AND size(COALESCE(r.chunkIds, [])) > 1
    SET r.chunkIds = [x IN COALESCE(r.chunkIds, []) WHERE x <> $chunkId], r.updatedAt = $timestamp
  `;
  await session.run(removeRelationshipChunkQuery, {
    collectionId,
    chunkId,
    timestamp: Date.now(),
  });

  const deleteNodeQuery = `
    MATCH (n:Node {collectionId: $collectionId})
    WHERE $chunkId IN COALESCE(n.chunkIds, []) AND size(COALESCE(n.chunkIds, [])) = 1
    DETACH DELETE n
  `;
  await session.run(deleteNodeQuery, { collectionId, chunkId });

  const removeNodeChunkQuery = `
    MATCH (n:Node {collectionId: $collectionId})
    WHERE $chunkId IN COALESCE(n.chunkIds, []) AND size(COALESCE(n.chunkIds, [])) > 1
    SET n.chunkIds = [x IN COALESCE(n.chunkIds, []) WHERE x <> $chunkId]
  `;
  await session.run(removeNodeChunkQuery, { collectionId, chunkId });

  const pruneEmptyNodesQuery = `
    MATCH (n:Node {collectionId: $collectionId})
    WHERE size(COALESCE(n.chunkIds, [])) = 0
    DETACH DELETE n
  `;
  await session.run(pruneEmptyNodesQuery, { collectionId });

  await session.close();
}

export async function removeByRelationship(
  collectionId: string,
  from: string,
  to: string,
  relationship: string
) {
  const session = driver.session();
  const normalizedFrom = normalizeIdentifier(from);
  const normalizedTo = normalizeIdentifier(to);
  const relationshipType = normalizeIdentifier(relationship);
  const deleteQuery = `
    MATCH (n:Node {collectionId: $collectionId})-[r:\`${relationshipType}\`]->(m:Node {collectionId: $collectionId})
    WHERE n.name = $from AND m.name = $to
    DETACH DELETE r
  `;
  await session.run(deleteQuery, {
    collectionId,
    from: normalizedFrom,
    to: normalizedTo,
  });
  await session.close();
}
