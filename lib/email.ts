// // Chemin : lib/email.ts
// import { Resend } from "resend"

// const resend = new Resend(process.env.RESEND_API_KEY)

// export async function sendConfirmationEmail(email: string, confirmationUrl: string, firstName?: string) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: "Nella@House <noreply@nellahouse.com>",
//       to: email,
//       subject: "Confirmez votre inscription - Nella@House",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <div style="background: #c45a3a; padding: 20px; text-align: center;">
//             <h1 style="color: white; margin: 0;">Nella@House Consulting</h1>
//           </div>
//           <div style="padding: 20px;">
//             <h2>Bonjour ${firstName || "cher client"} !</h2>
//             <p>Merci de vous être inscrit sur Nella@House Consulting.</p>
//             <p>Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${confirmationUrl}" style="background: #c45a3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Confirmer mon compte</a>
//             </div>
//             <p>Ou copiez ce lien :</p>
//             <p style="background: #f4f4f4; padding: 10px; word-break: break-all;">${confirmationUrl}</p>
//             <p>Ce lien expirera dans 24 heures.</p>
//             <p>À très bientôt sur Nella@House !</p>
//           </div>
//           <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
//             <p>Nella@House Consulting - Mode Africaine Premium</p>
//           </div>
//         </div>
//       `,
//     })

//     if (error) {
//       console.error("Erreur envoi email:", error)
//       return { error }
//     }

//     return { success: true, data }
//   } catch (error) {
//     console.error("Erreur:", error)
//     return { error }
//   }
// }