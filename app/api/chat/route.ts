import { NextRequest, NextResponse } from 'next/server';
import { sanitizeText } from '@/lib/security';

// Fallback offline responses in case external API is temporarily unreachable or quota exceeded
function getOfflineFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('open parcel') || q.includes('open-parcel') || q.includes('check before payment') || q.includes('rider')) {
    return `📦 **Open-Parcel Cash on Delivery (COD)**:
VoltPhone PK offers 100% Open-Parcel Delivery across Pakistan.
When the courier rider arrives at your doorstep:
1. You are legally authorized to open the flyer in front of the rider.
2. Inspect the brand box, intact factory security seal, model, color, and physical condition.
3. Once satisfied, hand over the cash to the courier.
If anything is amiss or damaged, you can reject the parcel right at the doorstep!`;
  }

  if (q.includes('pta') || q.includes('dirbs') || q.includes('approved') || q.includes('verify')) {
    return `✅ **100% Official PTA-Approved Guarantee**:
Every phone on VoltPhone PK is legally imported with full customs duty and PTA taxes paid.
How to verify:
- Dial **\`*#06#\`** on any phone to get its 15-digit IMEI.
- SMS the IMEI to **8484** (PTA DIRBS shortcode) or verify at **dirbs.pta.gov.pk**.
- Your invoice from VoltPhone PK acts as official purchase proof.`;
  }

  if (q.includes('installment') || q.includes('emi') || q.includes('markup') || q.includes('bank') || q.includes('card')) {
    return `💳 **0% Markup Easy Monthly Installments (EMI)**:
Enjoy 0% markup installments through partner credit cards:
- **Eligible Banks**: Bank Alfalah, Meezan Bank, Faysal Bank, and Silkbank.
- **Tenures**: 3, 6, or 12 months.
- **Process**: Select "Credit Card EMI" during checkout, choose your bank and tenure, and your monthly plan will be activated with zero hidden interest.`;
  }

  if (q.includes('warranty') || q.includes('repair') || q.includes('service center') || q.includes('guarantee')) {
    return `🛡️ **1-Year Official Brand Warranty**:
All our mobile phones carry official manufacturer warranties claimable at authorized service centers nationwide:
- **Samsung**: Official Samsung Customer Service Centers.
- **Apple**: Mercantile & FutureTech Authorized Centers.
- **Xiaomi / Redmi / Poco**: Airlink & Smart Zone.
- **Tecno & Infinix**: Carlcare Centers nationwide.
- **Vivo & Oppo**: Official Brand Service Centers.
- **Nokia & Itel**: HMD Global & authorized hubs.`;
  }

  if (q.includes('contact') || q.includes('call') || q.includes('whatsapp') || q.includes('number') || q.includes('support') || q.includes('helpline')) {
    return `📞 **Official Customer Support**:
We are here to assist you Mon-Sat (9:00 AM - 10:00 PM PKT):
- **Official Phone Helpline**: +92 313 5221200
- **Direct WhatsApp**: [Chat on WhatsApp (+92 313 5221200)](https://wa.me/923135221200)
- **Email**: support@voltphone.pk`;
  }

  if (q.includes('delivery') || q.includes('shipping') || q.includes('time') || q.includes('days')) {
    return `🚚 **Fast Nationwide Delivery**:
- **Karachi, Lahore, Islamabad, Rawalpindi**: 24 to 48 hours.
- **Other Cities & Nationwide**: 2 to 4 working days via Leopard Courier, TCS & Trax.
- All shipments are insured and come with Open-Parcel inspection!`;
  }

  if (q.includes('button') || q.includes('keypad') || q.includes('nokia') || q.includes('itel')) {
    return `📱 **Keypad & Feature Phones**:
We have a full collection of durable PTA-approved button phones starting from Rs. 3,500!
- **Nokia 105 / 106 / 110 / 5310**
- **Itel Magic 2 / Power 100 / Circle 1**
All feature phones have long battery lives, FM radio, loud speakers, and dual-SIM support with Open-Parcel COD.`;
  }

  return `👋 Welcome to **VoltPhone PK**!
I'm VoltBot, your AI shopping assistant. Here is what I can help you with:
- 📦 **Open-Parcel COD**: How you can inspect your phone before paying.
- ✅ **PTA Verification**: Checking DIRBS approval via 8484.
- 💳 **0% EMI Installments**: Supported banks (Bank Alfalah, Meezan, Faysal, Silkbank).
- 🛡️ **Brand Warranties**: Official 1-year brand warranty centers.
- 📱 **Phone Recommendations**: Keypad & flagship recommendations by budget.
- 📞 **Direct WhatsApp**: [Click to chat with an agent at +92 313 5221200](https://wa.me/923135221200).

How can I assist your mobile shopping today?`;
}

const SYSTEM_PROMPT = `You are "VoltBot", the official AI shopping and support assistant for VoltPhone PK (voltphone.pk) - Pakistan's #1 PTA-Approved Mobile Marketplace.

VoltPhone PK Core Information:
- Official Helpline / Phone: +92 313 5221200
- Official WhatsApp: +92 313 5221200 (direct link: https://wa.me/923135221200)
- Email: support@voltphone.pk
- Support Hours: Monday to Saturday, 9:00 AM - 10:00 PM PKT
- Over 220+ PTA-Approved phones in stock (flagships, mid-rangers, budget phones, and classic button/keypad phones like Nokia 105/110 and Itel).

Key Store Policies:
1. Open-Parcel Cash on Delivery (COD):
   - Available nationwide in all cities (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad, etc.).
   - The courier rider waits at the doorstep while the customer opens the flyer and verifies the intact box seal, brand, color, and physical condition before paying.
2. 100% Official PTA DIRBS Approved:
   - All devices are officially registered with PTA taxes paid.
   - Customers can verify IMEI by dialing *#06# and sending the 15-digit IMEI to 8484 via SMS or checking dirbs.pta.gov.pk.
3. 0% Markup EMI Installments:
   - Available on credit cards of Bank Alfalah, Meezan Bank, Faysal Bank, and Silkbank for 3, 6, or 12 months with zero interest markup.
4. 1-Year Official Brand Warranty:
   - Handled directly by authorized service centers nationwide (Samsung Care, Mercantile/FutureTech for Apple, Airlink/Smart Zone for Xiaomi/Poco, Carlcare for Tecno/Infinix, etc.). VoltPhone invoice is the official proof of purchase.
5. Delivery Timelines:
   - Major cities: 24 to 48 hours.
   - Rest of Pakistan: 2 to 4 working days via TCS, Leopard, Trax.

Response Guidelines:
- Respond in clear, polite, concise, professional English.
- Use bullet points, bold text, and structured headings for readability.
- When budget recommendations are requested, suggest realistic popular models with prices in Pakistani Rupees (PKR / Rs.).
- Always provide the WhatsApp contact link (https://wa.me/923135221200) if the user wants to talk to a human agent, place an urgent custom order, or track a package.
- Never mention competitors like PriceOye or Daraz. Maintain VoltPhone PK's brand identity.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMessage = body?.message || '';
    const rawHistory = Array.isArray(body?.history) ? body.history : [];

    // Sanitize user input
    const cleanMessage = sanitizeText(rawMessage, 500);

    if (!cleanMessage) {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || '';

    // Format chat contents for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Take up to the last 6 messages of history to conserve tokens and maintain context
    const recentHistory = rawHistory.slice(-6);
    for (const item of recentHistory) {
      if (item && item.text && (item.role === 'user' || item.role === 'model')) {
        contents.push({
          role: item.role,
          parts: [{ text: sanitizeText(item.text, 500) }],
        });
      }
    }

    // Append the current user message
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }],
    });

    // Prioritize active and stable models
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-lite-latest',
    ];

    let reply = '';
    let apiSuccess = false;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 800,
            },
          }),
          signal: AbortSignal.timeout(4500),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            reply = generatedText.trim();
            apiSuccess = true;
            break;
          }
        }
      } catch {
        // Continue to next candidate model or fallback
      }
    }

    // If external AI call failed, gracefully use our rich local knowledge fallback engine
    if (!apiSuccess || !reply) {
      reply = getOfflineFallbackResponse(cleanMessage);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { reply: getOfflineFallbackResponse('') },
      { status: 200 }
    );
  }
}
