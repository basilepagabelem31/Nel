// // Chemin : app/api/auth/resend-confirmation/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"
// import { sendConfirmationEmail } from "@/lib/email"

// export async function POST(request: NextRequest) {
//   try {
//     const { email } = await request.json()
    
//     if (!email) {
//       return NextResponse.json({ error: "Email requis" }, { status: 400 })
//     }

//     const supabase = await createClient()
    
//     // Renvoyer l'email de confirmation via Supabase
//     const { error } = await supabase.auth.resend({
//       type: "signup",
//       email,
//     })

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
//   }
// }