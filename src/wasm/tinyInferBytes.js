const WASM_MAGIC_AND_VERSION = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];
const I32 = 0x7f;

const opcode = {
  localGet: 0x20,
  i32Const: 0x41,
  i32Add: 0x6a,
  i32Sub: 0x6b,
  i32Mul: 0x6c,
  end: 0x0b,
};

function encodeU32(value) {
  const bytes = [];
  let remaining = value >>> 0;

  do {
    let byte = remaining & 0x7f;
    remaining >>>= 7;
    if (remaining !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (remaining !== 0);

  return bytes;
}

function encodeI32(value) {
  const bytes = [];
  let remaining = value | 0;
  let more = true;

  while (more) {
    let byte = remaining & 0x7f;
    remaining >>= 7;

    const signBitSet = (byte & 0x40) !== 0;
    more = !(
      (remaining === 0 && !signBitSet) ||
      (remaining === -1 && signBitSet)
    );

    if (more) {
      byte |= 0x80;
    }
    bytes.push(byte);
  }

  return bytes;
}

function vector(bytes) {
  return [...encodeU32(bytes.length), ...bytes];
}

function section(id, bytes) {
  return [id, ...encodeU32(bytes.length), ...bytes];
}

function nameBytes(name) {
  const encoded = new TextEncoder().encode(name);
  return [...encodeU32(encoded.length), ...encoded];
}

function localGet(index) {
  return [opcode.localGet, ...encodeU32(index)];
}

function i32Const(value) {
  return [opcode.i32Const, ...encodeI32(value)];
}

function functionBody(instructions) {
  const locals = vector([]);
  const body = [...locals, ...instructions, opcode.end];
  return [...encodeU32(body.length), ...body];
}

function exportedFunction(name, index) {
  return [
    ...nameBytes(name),
    0x00,
    ...encodeU32(index),
  ];
}

function scoreCalmBody() {
  return functionBody([
    ...i32Const(40),
    ...localGet(0),
    ...i32Const(2),
    opcode.i32Mul,
    opcode.i32Sub,
    ...localGet(1),
    opcode.i32Add,
    ...localGet(2),
    ...i32Const(3),
    opcode.i32Mul,
    opcode.i32Sub,
  ]);
}

function scoreBuildBody() {
  return functionBody([
    ...i32Const(-25),
    ...localGet(0),
    ...i32Const(4),
    opcode.i32Mul,
    opcode.i32Add,
    ...localGet(1),
    ...i32Const(2),
    opcode.i32Mul,
    opcode.i32Add,
    ...localGet(2),
    opcode.i32Sub,
  ]);
}

function scoreExploreBody() {
  return functionBody([
    ...i32Const(5),
    ...localGet(0),
    opcode.i32Add,
    ...localGet(1),
    opcode.i32Sub,
    ...localGet(2),
    ...i32Const(3),
    opcode.i32Mul,
    opcode.i32Add,
  ]);
}

export function buildTinyInferWasm() {
  const functionType = [
    0x60,
    ...vector([I32, I32, I32]),
    ...vector([I32]),
  ];
  const typeSection = section(1, [1, ...functionType]);
  const functionSection = section(3, [3, 0, 0, 0]);
  const exportSection = section(7, [
    3,
    ...exportedFunction("score_calm", 0),
    ...exportedFunction("score_build", 1),
    ...exportedFunction("score_explore", 2),
  ]);
  const codeSection = section(10, [
    3,
    ...scoreCalmBody(),
    ...scoreBuildBody(),
    ...scoreExploreBody(),
  ]);

  return new Uint8Array([
    ...WASM_MAGIC_AND_VERSION,
    ...typeSection,
    ...functionSection,
    ...exportSection,
    ...codeSection,
  ]);
}
