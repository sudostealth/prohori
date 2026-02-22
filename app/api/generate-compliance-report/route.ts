import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { month } = await req.json();

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      url: `/compliance/reports/CSA-Audit-${month}.pdf`,
      message: `Report for ${month} generated successfully.`
    });
  } catch (error) {
    console.error(error); // Log the error to use the variable
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
