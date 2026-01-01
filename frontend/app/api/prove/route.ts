import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import path from 'path'
import fs from 'fs/promises'

export async function POST(req: Request) {
  console.log('🔵 API route /api/prove called')
  
  try {
    const { secret, recipient, amount, commitment: expectedCommitment } = await req.json()
    console.log('📦 Request:', { secret, recipient, amount, expectedCommitment })

    if (!secret || !recipient || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate recipient hash using Ethereum keccak256
    const recipientHash = ethers.solidityPackedKeccak256(
      ['address'],
      [recipient]
    )

    console.log('🔢 Computing commitment using circuit formula...')

    // Convert to BigInt for circuit math
    const secretBN = BigInt(secret)
    const recipientHashBN = BigInt(recipientHash)
    const amountBN = BigInt(amount)

    // Circuit's hash formula:
    // temp1 = secret * 3 + recipientHash * 5
    // temp2 = temp1 + amount * 7
    // temp2Squared = temp2 * temp2
    // commitment = temp2 * 11 + temp2Squared
    const temp1 = secretBN * 3n + recipientHashBN * 5n
    const temp2 = temp1 + amountBN * 7n
    const temp2Squared = temp2 * temp2
    const computedCommitment = temp2 * 11n + temp2Squared

    console.log('✅ Computed commitment:', computedCommitment.toString())

    if (expectedCommitment) {
      console.log('🔍 Expected commitment:', expectedCommitment)
      if (BigInt(expectedCommitment) !== computedCommitment) {
        console.log('⚠️  Warning: Commitment mismatch!')
      }
    }

    // Prepare circuit inputs (all as numeric strings)
    const input = {
      commitment: computedCommitment.toString(),
      amount: amountBN.toString(),
      secret: secretBN.toString(),
      recipientHash: recipientHashBN.toString()
    }

    console.log('🔄 Circuit input:', input)

    const wasmPath = path.join(process.cwd(), 'public/circuits/payment.wasm')
    const zkeyPath = path.join(process.cwd(), 'public/circuits/payment.zkey')

    // Verify files exist
    await fs.access(wasmPath)
    await fs.access(zkeyPath)
    console.log('✅ Circuit files found')

    console.log('🔄 Generating proof...')
    const snarkjs = await import('snarkjs')

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    )

    console.log('✅ Proof generated!')
    console.log('📤 Public signals:', publicSignals)

    return NextResponse.json({
      proof: {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]]
        ],
        c: [proof.pi_c[0], proof.pi_c[1]]
      },
      publicSignals: [publicSignals[0], publicSignals[1]]
    })

  } catch (error: any) {
    console.error('❌ ERROR:', error.message)
    console.error('Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: error?.message || 'Proof generation failed',
        details: error?.stack 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'working',
    message: 'Use POST to generate proofs' 
  })
}

