import { syncPlans } from '@/actions/payments'

export async function POST() {
  try {
    const plans = await syncPlans()
    return Response.json({ success: true, plans }, { status: 200 })
  } catch (error) {
    console.error('Error syncing plans:', error)
    return Response.json(
      { success: false, error: 'Failed to sync plans' },
      { status: 500 }
    )
  }
}