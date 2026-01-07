import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import path from 'path'
import { readFileSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')

function mod(n: bigint, m: bigint = FIELD_PRIME): bigint {
  const result = n % m
  return result < 0n ? result + m : result
}

// Cache circuit files
let circuitCache: { wasm: Buffer; zkey: Buffer } | null = null

function getCircuitFiles() {
  if (!circuitCache) {
    console.log('📦 Loading circuit files into memory...')
    const startLoad = Date.now()
    const wasmPath = path.join(process.cwd(), 'public/circuits/payment.wasm')
    const zkeyPath = path.join(process.cwd(), 'public/circuits/payment.zkey')
    
    circuitCache = {
      wasm: readFileSync(wasmPath),
      zkey: readFileSync(zkeyPath)
    }
    console.log(`✅ Circuit files cached in ${Date.now() - startLoad}ms`)
    console.log(`   WASM: ${circuitCache.wasm.length} bytes`)
    console.log(`   ZKEY: ${circuitCache.zkey.length} bytes`)
  }
  return circuitCache
}

export async function POST(req: Request) {
  const startTime = Date.now()
  console.log('🔵 POST /api/prove called at', new Date().toISOString())
  
  try {
    console.log('⏱️  [1] Parsing request...')
    const { secret, recipient, amount } = await req.json()
    console.log(`⏱️  [2] Request parsed in ${Date.now() - startTime}ms`)

    if (!secret || !recipient || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('⏱️  [3] Computing commitment...')
    const recipientHashFull = ethers.solidityPackedKeccak256(['address'], [recipient])
    
    const secretBN = mod(BigInt(secret))
    const recipientHashBN = mod(BigInt(recipientHashFull))
    const amountBN = mod(BigInt(amount))

    const temp1 = mod(secretBN * 3n + recipientHashBN * 5n)
    const temp2 = mod(temp1 + amountBN * 7n)
    const temp2Squared = mod(temp2 * temp2)
    const computedCommitment = mod(temp2 * 11n + temp2Squared)

    const input = {
      commitment: computedCommitment.toString(),
      amount: amountBN.toString(),
      secret: secretBN.toString(),
      recipientHash: recipientHashBN.toString()
    }
    console.log(`⏱️  [4] Commitment computed in ${Date.now() - startTime}ms`)

    console.log('⏱️  [5] Loading snarkjs...')
    const snarkjsStart = Date.now()
    const snarkjs = require('snarkjs')
    console.log(`⏱️  [6] snarkjs loaded in ${Date.now() - snarkjsStart}ms`)
    
    console.log('⏱️  [7] Getting cached circuit files...')
    const { wasm, zkey } = getCircuitFiles()
    console.log(`⏱️  [8] Circuit files ready in ${Date.now() - startTime}ms`)
    
    console.log('🔄 [9] Starting proof generation...')
    const proveStart = Date.now()
    
    // Set up progress logging
    let progressInterval = setInterval(() => {
      console.log(`   ⏳ Still proving... ${Date.now() - proveStart}ms`)
    }, 2000)
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      { type: 'mem', data: wasm },
      { type: 'mem', data: zkey }
    )

    clearInterval(progressInterval)
    const proveTime = Date.now() - proveStart
    console.log(`✅ [10] Proof generated in ${proveTime}ms`)
    console.log(`⏱️  TOTAL TIME: ${Date.now() - startTime}ms`)

    return NextResponse.json({
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
    })

  } catch (error: any) {
    console.error(`❌ ERROR after ${Date.now() - startTime}ms:`, error.message)
    console.error('Stack:', error.stack)
    
    return NextResponse.json(
      { error: error?.message || 'Proof generation failed' },
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


// import { NextResponse } from 'next/server'
// import { ethers } from 'ethers'
// import path from 'path'
// import fs from 'fs/promises'

// const FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')

// function mod(n: bigint, m: bigint = FIELD_PRIME): bigint {
//   const result = n % m
//   return result < 0n ? result + m : result
// }

// export async function POST(req: Request) {
//   const startTime = Date.now()
//   console.log('🔵 API route /api/prove called at', new Date().toISOString())
  
//   try {
//     const parseStart = Date.now()
//     const { secret, recipient, amount } = await req.json()
//     console.log(`⏱️  Parse: ${Date.now() - parseStart}ms`)
//     console.log('📦 Request:', { secret: secret.slice(0, 20) + '...', recipient, amount })

//     if (!secret || !recipient || !amount) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
//     }

//     const hashStart = Date.now()
//     const recipientHashFull = ethers.solidityPackedKeccak256(['address'], [recipient])
    
//     const secretBN = mod(BigInt(secret))
//     const recipientHashBN = mod(BigInt(recipientHashFull))
//     const amountBN = mod(BigInt(amount))

//     const temp1 = mod(secretBN * 3n + recipientHashBN * 5n)
//     const temp2 = mod(temp1 + amountBN * 7n)
//     const temp2Squared = mod(temp2 * temp2)
//     const computedCommitment = mod(temp2 * 11n + temp2Squared)

//     console.log(`⏱️  Hash computation: ${Date.now() - hashStart}ms`)
//     console.log('✅ Commitment:', computedCommitment.toString().slice(0, 30) + '...')

//     const input = {
//       commitment: computedCommitment.toString(),
//       amount: amountBN.toString(),
//       secret: secretBN.toString(),
//       recipientHash: recipientHashBN.toString()
//     }

//     console.log('📊 Input sizes (digits):')
//     console.log('  commitment:', input.commitment.length)
//     console.log('  amount:', input.amount.length)
//     console.log('  secret:', input.secret.length)
//     console.log('  recipientHash:', input.recipientHash.length)

//     // Check if numbers exceed field prime
//     if (BigInt(input.commitment) >= FIELD_PRIME) {
//       console.log('⚠️  WARNING: Commitment exceeds field prime!')
//     }
//     if (BigInt(input.secret) >= FIELD_PRIME) {
//       console.log('⚠️  WARNING: Secret exceeds field prime!')
//     }
//     if (BigInt(input.recipientHash) >= FIELD_PRIME) {
//       console.log('⚠️  WARNING: RecipientHash exceeds field prime!')
//     }

//     const fileStart = Date.now()
//     const wasmPath = path.join(process.cwd(), 'public/circuits/payment.wasm')
//     const zkeyPath = path.join(process.cwd(), 'public/circuits/payment.zkey')

//     const wasmStat = await fs.stat(wasmPath)
//     const zkeyStat = await fs.stat(zkeyPath)
    
//     console.log('📁 Circuit files:')
//     console.log('  WASM:', wasmPath)
//     console.log('    Size:', (wasmStat.size / 1024).toFixed(2), 'KB')
//     console.log('    Modified:', wasmStat.mtime.toISOString())
//     console.log('  ZKEY:', zkeyPath)
//     console.log('    Size:', (zkeyStat.size / 1024).toFixed(2), 'KB')
//     console.log('    Modified:', zkeyStat.mtime.toISOString())
//     console.log(`⏱️  File checks: ${Date.now() - fileStart}ms`)

//     const loadStart = Date.now()
//     const snarkjs = await import('snarkjs')
//     console.log(`⏱️  snarkjs load: ${Date.now() - loadStart}ms`)

//     console.log('🔄 Starting proof generation...')
//     const proveStart = Date.now()
    
//     // Set a timeout to log progress
//     const progressInterval = setInterval(() => {
//       console.log(`⏳ Still proving... ${Date.now() - proveStart}ms elapsed`)
//     }, 5000)

//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//       input,
//       wasmPath,
//       zkeyPath
//     )

//     clearInterval(progressInterval)
//     const proveTime = Date.now() - proveStart
//     console.log(`⏱️  Proof generation: ${proveTime}ms`)

//     if (proveTime > 10000) {
//       console.log('⚠️  WARNING: Proof took > 10 seconds! Circuit may not be using field arithmetic properly.')
//     }

//     console.log('✅ Proof generated successfully!')
//     console.log('📤 Public signals:', publicSignals.map((s: string) => s.slice(0, 20) + '...'))

//     const totalTime = Date.now() - startTime
//     console.log(`⏱️  TOTAL TIME: ${totalTime}ms`)

//     return NextResponse.json({
//       proof: {
//         a: [proof.pi_a[0], proof.pi_a[1]],
//         b: [
//           [proof.pi_b[0][1], proof.pi_b[0][0]],
//           [proof.pi_b[1][1], proof.pi_b[1][0]]
//         ],
//         c: [proof.pi_c[0], proof.pi_c[1]]
//       },
//       publicSignals: [publicSignals[0], publicSignals[1]],
//       _debug: {
//         totalTime,
//         proveTime,
//         wasmSize: wasmStat.size,
//         zkeySize: zkeyStat.size
//       }
//     })

//   } catch (error: any) {
//     const errorTime = Date.now() - startTime
//     console.error(`❌ ERROR after ${errorTime}ms:`, error.message)
//     console.error('Stack:', error.stack)
    
//     return NextResponse.json(
//       { 
//         error: error?.message || 'Proof generation failed',
//         time: errorTime
//       },
//       { status: 500 }
//     )
//   }
// }

// export async function GET() {
//   return NextResponse.json({ 
//     status: 'working',
//     message: 'Use POST to generate proofs',
//     fieldPrime: FIELD_PRIME.toString()
//   })
// }


















// import { NextResponse } from 'next/server'
// import { ethers } from 'ethers'
// import path from 'path'
// import fs from 'fs/promises'

// // BN254 curve field prime (snarkjs default)
// const FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')

// // Modular arithmetic helper
// function mod(n: bigint, m: bigint = FIELD_PRIME): bigint {
//   const result = n % m
//   return result < 0n ? result + m : result
// }

// export async function POST(req: Request) {
//   console.log('🔵 API route /api/prove called')
  
//   try {
//     const { secret, recipient, amount } = await req.json()
//     console.log('📦 Request:', { secret, recipient, amount })

//     if (!secret || !recipient || !amount) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     // Generate recipient hash
//     const recipientHashFull = ethers.solidityPackedKeccak256(['address'], [recipient])
    
//     console.log('🔢 Computing commitment with field modulus...')

//     // Convert inputs and reduce to field
//     const secretBN = mod(BigInt(secret))
//     const recipientHashBN = mod(BigInt(recipientHashFull))
//     const amountBN = mod(BigInt(amount))

//     // Circuit's hash formula (all operations are mod FIELD_PRIME)
//     const temp1 = mod(secretBN * 3n + recipientHashBN * 5n)
//     const temp2 = mod(temp1 + amountBN * 7n)
//     const temp2Squared = mod(temp2 * temp2)
//     const computedCommitment = mod(temp2 * 11n + temp2Squared)

//     console.log('✅ Commitment:', computedCommitment.toString())

//     // Prepare circuit inputs (all reduced to field)
//     const input = {
//       commitment: computedCommitment.toString(),
//       amount: amountBN.toString(),
//       secret: secretBN.toString(),
//       recipientHash: recipientHashBN.toString()
//     }

//     console.log('🔄 Generating proof...')

//     const wasmPath = path.join(process.cwd(), 'public/circuits/payment.wasm')
//     const zkeyPath = path.join(process.cwd(), 'public/circuits/payment.zkey')

//     await fs.access(wasmPath)
//     await fs.access(zkeyPath)

//     const snarkjs = await import('snarkjs')

//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//       input,
//       wasmPath,
//       zkeyPath
//     )

//     console.log('✅ Proof generated in reasonable time!')

//     return NextResponse.json({
//       proof: {
//         a: [proof.pi_a[0], proof.pi_a[1]],
//         b: [
//           [proof.pi_b[0][1], proof.pi_b[0][0]],
//           [proof.pi_b[1][1], proof.pi_b[1][0]]
//         ],
//         c: [proof.pi_c[0], proof.pi_c[1]]
//       },
//       publicSignals: [publicSignals[0], publicSignals[1]]
//     })

//   } catch (error: any) {
//     console.error('❌ ERROR:', error.message)
    
//     return NextResponse.json(
//       { error: error?.message || 'Proof generation failed' },
//       { status: 500 }
//     )
//   }
// }

// export async function GET() {
//   return NextResponse.json({ 
//     status: 'working',
//     message: 'Use POST to generate proofs' 
//   })
// }









// import { NextResponse } from 'next/server'
// import { ethers } from 'ethers'
// import path from 'path'
// import fs from 'fs/promises'

// export async function POST(req: Request) {
//   console.log('🔵 API route /api/prove called')
  
//   try {
//     const { secret, recipient, amount, commitment: expectedCommitment } = await req.json()
//     console.log('📦 Request:', { secret, recipient, amount, expectedCommitment })

//     if (!secret || !recipient || !amount) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     // Generate recipient hash using Ethereum keccak256
//     const recipientHash = ethers.solidityPackedKeccak256(
//       ['address'],
//       [recipient]
//     )

//     console.log('🔢 Computing commitment using circuit formula...')

//     // Convert to BigInt for circuit math
//     const secretBN = BigInt(secret)
//     const recipientHashBN = BigInt(recipientHash)
//     const amountBN = BigInt(amount)

//     // Circuit's hash formula:
//     // temp1 = secret * 3 + recipientHash * 5
//     // temp2 = temp1 + amount * 7
//     // temp2Squared = temp2 * temp2
//     // commitment = temp2 * 11 + temp2Squared
//     const temp1 = secretBN * 3n + recipientHashBN * 5n
//     const temp2 = temp1 + amountBN * 7n
//     const temp2Squared = temp2 * temp2
//     const computedCommitment = temp2 * 11n + temp2Squared

//     console.log('✅ Computed commitment:', computedCommitment.toString())

//     if (expectedCommitment) {
//       console.log('🔍 Expected commitment:', expectedCommitment)
//       if (BigInt(expectedCommitment) !== computedCommitment) {
//         console.log('⚠️  Warning: Commitment mismatch!')
//       }
//     }

//     // Prepare circuit inputs (all as numeric strings)
//     const input = {
//       commitment: computedCommitment.toString(),
//       amount: amountBN.toString(),
//       secret: secretBN.toString(),
//       recipientHash: recipientHashBN.toString()
//     }

//     console.log('🔄 Circuit input:', input)

//     const wasmPath = path.join(process.cwd(), 'public/circuits/payment.wasm')
//     const zkeyPath = path.join(process.cwd(), 'public/circuits/payment.zkey')

//     // Verify files exist
//     await fs.access(wasmPath)
//     await fs.access(zkeyPath)
//     console.log('✅ Circuit files found')

//     console.log('🔄 Generating proof...')
//     const snarkjs = await import('snarkjs')

//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//       input,
//       wasmPath,
//       zkeyPath
//     )

//     console.log('✅ Proof generated!')
//     console.log('📤 Public signals:', publicSignals)

//     return NextResponse.json({
//       proof: {
//         a: [proof.pi_a[0], proof.pi_a[1]],
//         b: [
//           [proof.pi_b[0][1], proof.pi_b[0][0]],
//           [proof.pi_b[1][1], proof.pi_b[1][0]]
//         ],
//         c: [proof.pi_c[0], proof.pi_c[1]]
//       },
//       publicSignals: [publicSignals[0], publicSignals[1]]
//     })

//   } catch (error: any) {
//     console.error('❌ ERROR:', error.message)
//     console.error('Stack:', error.stack)
    
//     return NextResponse.json(
//       { 
//         error: error?.message || 'Proof generation failed',
//         details: error?.stack 
//       },
//       { status: 500 }
//     )
//   }
// }

// export async function GET() {
//   return NextResponse.json({ 
//     status: 'working',
//     message: 'Use POST to generate proofs' 
//   })
// }

