const seenBodies = new Set();

export  function isDuplicateBody(body) {
  if (seenBodies.has(body)) {
    return true;
  }
  seenBodies.add(body);
  return false;
}
  