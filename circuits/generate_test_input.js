// Generate valid test input for payment circuit

const FIELD_PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function mod(n) {
  const result = n % FIELD_PRIME;
  return result < 0n ? result + FIELD_PRIME : result;
}

// Test values (all small numbers for easy verification)
const secret = 12345n;
const recipientHash = 67890n;
const amount = 1000000000000000000n; // 1 ETH in wei

// Compute commitment using circuit formula
const temp1 = mod(secret * 3n + recipientHash * 5n);
const temp2 = mod(temp1 + amount * 7n);
const temp2Squared = mod(temp2 * temp2);
const commitment = mod(temp2 * 11n + temp2Squared);

console.log('Test Input Values:');
console.log('=================');
console.log('secret:', secret.toString());
console.log('recipientHash:', recipientHash.toString());
console.log('amount:', amount.toString());
console.log('commitment:', commitment.toString());
console.log('');

// Generate input.json
const input = {
  commitment: commitment.toString(),
  amount: amount.toString(),
  secret: secret.toString(),
  recipientHash: recipientHash.toString()
};

console.log('input.json content:');
console.log(JSON.stringify(input, null, 2));
console.log('');

// Verify the math
console.log('Verification:');
console.log('temp1 =', temp1.toString());
console.log('temp2 =', temp2.toString());
console.log('temp2Squared =', temp2Squared.toString());
console.log('commitment =', commitment.toString());