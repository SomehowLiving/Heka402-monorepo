import * as snarkjs from 'snarkjs';
import { readFileSync } from 'fs';

const FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

function mod(n, m = FIELD_PRIME) {
  const result = n % m;
  return result < 0n ? result + m : result;
}

async function testProof() {
  console.time('⏱️  Total proof time');
  
  const secret = mod(BigInt('12345678901234567890'));
  const recipientHash = mod(BigInt('98765432109876543210'));
  const amount = BigInt('3000000000000000');
  
  const temp1 = mod(secret * 3n + recipientHash * 5n);
  const temp2 = mod(temp1 + amount * 7n);
  const temp2Squared = mod(temp2 * temp2);
  const commitment = mod(temp2 * 11n + temp2Squared);
  
  const input = {
    commitment: commitment.toString(),
    amount: amount.toString(),
    secret: secret.toString(),
    recipientHash: recipientHash.toString()
  };
  
  console.log('📊 Input:', input);
  
  console.time('⚡ Proof generation');
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    './payment_js/payment.wasm',
    './payment_final.zkey'
  );
  console.timeEnd('⚡ Proof generation');
  
  console.log('✅ Proof generated!');
  console.log('📤 Public signals:', publicSignals);
  console.timeEnd('⏱️  Total proof time');
  
  const vKey = JSON.parse(readFileSync('./verification_key.json'));
  const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  console.log('🔍 Verified:', verified);
}

testProof().catch(console.error);
