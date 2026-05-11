import { NextResponse } from 'next/server'
import { initializeCollections } from '@/lib/setup/collections'

export async function POST() {
  try {
    console.log('🚀 Starting Firestore setup...')

    const results = await initializeCollections()

    if (results.errors.length > 0) {
      console.error('❌ Setup errors:', results.errors)
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      message: `Created ${results.created.length} documents`,
      created: results.created,
      errors: results.errors,
    })
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sadak Saathi Firestore Setup API',
    usage: 'POST to this endpoint to initialize collections',
    collections: [
      'users',
      'potholes',
      'detections',
      'complaints',
      'jurisdictions',
      'departments',
      'media_assets',
      'notifications',
      'audit_logs',
    ],
  })
}
