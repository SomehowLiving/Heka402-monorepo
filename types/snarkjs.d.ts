/**
 * Type declarations for snarkjs
 */

declare module 'snarkjs' {
  export interface Groth16Proof {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: string;
    curve: string;
  }

  export interface Groth16PublicSignals {
    [key: number]: string;
  }

  export interface Groth16FullProof {
    proof: Groth16Proof;
    publicSignals: string[];
  }

  export const groth16: {
    fullProve(
      input: any,
      wasm: ArrayBuffer | Uint8Array,
      zkey: ArrayBuffer | Uint8Array
    ): Promise<Groth16FullProof>;
    prove(
      zkey: ArrayBuffer | Uint8Array,
      witnessCalculator: any,
      input: any
    ): Promise<Groth16FullProof>;
    verify(
      vKey: any,
      publicSignals: string[],
      proof: Groth16Proof
    ): Promise<boolean>;
  };
}

