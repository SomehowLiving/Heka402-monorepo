const express = require('express');
const cors = require('cors');
const snarkjs = require('snarkjs');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

function mod(n, m = FIELD_PRIME) {
  const result = n % m;
  return result < 0n ? result + m : result;
}

// Preload circuit files
console.log('📦 Loading circuit files...');
const wasmBuffer = fs.readFileSync(path.join(__dirname, '../circuits/payment_js/payment.wasm'));
const zkeyBuffer = fs.readFileSync(path.join(__dirname, '../circuits/payment_final.zkey'));
console.log('✅ Circuit files loaded');
console.log(`   WASM: ${wasmBuffer.length} bytes`);
console.log(`   ZKEY: ${zkeyBuffer.length} bytes`);

app.post('/api/prove', async (req, res) => {
  const startTime = Date.now();
  console.log('🔵 Proof request received');
  
  try {
    const { secret, recipient, amount } = req.body;

    if (!secret || !recipient || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recipientHashFull = ethers.solidityPackedKeccak256(['address'], [recipient]);
    
    const secretBN = mod(BigInt(secret));
    const recipientHashBN = mod(BigInt(recipientHashFull));
    const amountBN = mod(BigInt(amount));

    const temp1 = mod(secretBN * 3n + recipientHashBN * 5n);
    const temp2 = mod(temp1 + amountBN * 7n);
    const temp2Squared = mod(temp2 * temp2);
    const computedCommitment = mod(temp2 * 11n + temp2Squared);

    const input = {
      commitment: computedCommitment.toString(),
      amount: amountBN.toString(),
      secret: secretBN.toString(),
      recipientHash: recipientHashBN.toString()
    };

    console.log('🔄 Generating proof...');
    const proveStart = Date.now();
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      { type: 'mem', data: wasmBuffer },
      { type: 'mem', data: zkeyBuffer }
    );

    const proveTime = Date.now() - proveStart;
    console.log(`✅ Proof generated in ${proveTime}ms`);

    res.json({
      proof: {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]]
        ],
        c: [proof.pi_c[0], proof.pi_c[1]]
      },
      publicSignals: [publicSignals[0], publicSignals[1]],
      _debug: {
        totalTime: Date.now() - startTime,
        proveTime
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prove', (req, res) => {
  res.json({ status: 'working', message: 'Use POST to generate proofs' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Proof server running on http://localhost:${PORT}`);
});