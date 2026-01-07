pragma circom 2.0.0;

/**
 * @title Payment Privacy Circuit (Fixed)
 * @notice zk-SNARK circuit for proving payment knowledge without revealing identity
 * @dev Uses field-native arithmetic for fast proof generation
 * 
 * Circuit proves:
 * - User knows a valid commitment hash
 * - Payment amount matches commitment
 * - Commitment is valid (without revealing sender identity)
 * 
 * IMPORTANT: All inputs must be < field prime (254 bits)
 * Field prime p = 21888242871839275222246405745257275088548364400416034343698204186575808495617
 */

template PaymentProof() {
    // Public inputs (will be in public signals)
    signal input commitment;      // Public: commitment hash
    signal input amount;          // Public: payment amount
    
    // Private inputs (not in public signals)
    signal input secret;          // Private: secret value (sender identity/random)
    signal input recipientHash;   // Private: recipient hash (truncated to fit field)
    
    // Intermediate signals for hash computation
    signal temp1;
    signal temp2;
    signal temp2Squared;
    signal computedHash;
    
    // Multi-step hash computation using field arithmetic
    // All operations are automatically modulo the field prime
    
    // Step 1: Combine secret and recipientHash
    temp1 <== secret * 3 + recipientHash * 5;
    
    // Step 2: Combine with amount
    temp2 <== temp1 + amount * 7;
    
    // Step 3: Square temp2 (quadratic constraint)
    temp2Squared <== temp2 * temp2;
    
    // Step 4: Final hash transformation
    computedHash <== temp2 * 11 + temp2Squared;
    
    // Verify commitment matches computed hash
    commitment === computedHash;
    
    // Note: All arithmetic is modulo field prime automatically
    // No explicit modulo operations needed
}

component main {public [commitment, amount]} = PaymentProof();