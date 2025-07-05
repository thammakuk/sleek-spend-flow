import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSMessage {
  address: string
  body: string
  date: number
}

interface ParsedExpense {
  amount: number
  description: string
  categoryId: string
  date: string
  paymentMethod: string
  merchantName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { smsMessages } = await req.json()
    console.log(`Processing ${smsMessages.length} SMS messages for user ${user.id}`)

    // Get user's categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch categories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const parsedExpenses: ParsedExpense[] = []

    for (const sms of smsMessages as SMSMessage[]) {
      const parsed = parseTransactionSMS(sms, categories)
      if (parsed) {
        parsedExpenses.push(parsed)
      }
    }

    console.log(`Parsed ${parsedExpenses.length} expenses from SMS`)

    // Insert parsed expenses into database
    const expensesToInsert = parsedExpenses.map(expense => ({
      user_id: user.id,
      amount: expense.amount,
      description: expense.description,
      category_id: expense.categoryId,
      date: expense.date,
      payment_method: expense.paymentMethod,
      recurring_enabled: false
    }))

    if (expensesToInsert.length > 0) {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expensesToInsert)
        .select()

      if (error) {
        console.error('Error inserting expenses:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save expenses' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Successfully inserted ${data.length} expenses`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedMessages: smsMessages.length,
        parsedExpenses: parsedExpenses.length,
        insertedExpenses: expensesToInsert.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sms-expense-parser:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseTransactionSMS(sms: SMSMessage, categories: any[]): ParsedExpense | null {
  const message = sms.body.toLowerCase()
  const address = sms.address.toLowerCase()

  // Skip if not a transaction SMS
  if (!isTransactionSMS(message, address)) {
    return null
  }

  // Extract amount
  const amount = extractAmount(message)
  if (!amount) return null

  // Extract merchant/description
  const description = extractDescription(message)
  
  // Categorize based on merchant and message content
  const categoryId = categorizeTransaction(message, description, categories)
  
  // Determine payment method
  const paymentMethod = extractPaymentMethod(message)
  
  // Convert date
  const date = new Date(sms.date).toISOString().split('T')[0]

  return {
    amount,
    description,
    categoryId,
    date,
    paymentMethod
  }
}

function isTransactionSMS(message: string, address: string): boolean {
  const bankKeywords = ['hdfc', 'sbi', 'icici', 'axis', 'kotak', 'paytm', 'gpay', 'phonepe', 'bharatpe']
  const transactionKeywords = ['debited', 'credited', 'spent', 'paid', 'transaction', 'purchase', 'debit', 'credit']
  
  const isFromBank = bankKeywords.some(bank => address.includes(bank))
  const hasTransactionKeyword = transactionKeywords.some(keyword => message.includes(keyword))
  
  return isFromBank || hasTransactionKeyword
}

function extractAmount(message: string): number | null {
  // Match patterns like Rs 1,234.50, INR 1234, ₹1,234.50
  const patterns = [
    /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /([0-9,]+(?:\.[0-9]{2})?)\s*(?:rs\.?|inr|₹)/i,
    /(?:amount|amt)[\s:]*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i
  ]
  
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      const amountStr = match[1].replace(/,/g, '')
      const amount = parseFloat(amountStr)
      if (!isNaN(amount) && amount > 0) {
        return amount
      }
    }
  }
  
  return null
}

function extractDescription(message: string): string {
  // Extract merchant name or transaction description
  const patterns = [
    /(?:at|to)\s+([a-zA-Z0-9\s&.-]+?)(?:\s+on|\s+using|\s*\.|$)/i,
    /(?:merchant|payee)[\s:]+([a-zA-Z0-9\s&.-]+?)(?:\s+on|\s+using|\s*\.|$)/i,
    /(?:purchase|payment)[\s:]+([a-zA-Z0-9\s&.-]+?)(?:\s+on|\s+using|\s*\.|$)/i
  ]
  
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  // Fallback: extract text between common keywords
  const words = message.split(' ')
  const keywordIndex = words.findIndex(word => 
    ['debited', 'credited', 'spent', 'paid'].includes(word.toLowerCase())
  )
  
  if (keywordIndex !== -1 && keywordIndex < words.length - 2) {
    return words.slice(keywordIndex + 1, keywordIndex + 4).join(' ')
  }
  
  return 'SMS Transaction'
}

function categorizeTransaction(message: string, description: string, categories: any[]): string {
  const text = (message + ' ' + description).toLowerCase()
  
  // Category mapping based on keywords
  const categoryMap = [
    { keywords: ['fuel', 'petrol', 'diesel', 'gas', 'bpcl', 'iocl', 'hpcl'], name: 'Fuel' },
    { keywords: ['fastag', 'toll', 'highway'], name: 'Fastag' },
    { keywords: ['electricity', 'electric', 'power', 'kseb', 'bescom', 'adani'], name: 'Electricity Bill' },
    { keywords: ['credit card', 'card payment', 'cc payment'], name: 'Credit Card Payment' },
    { keywords: ['loan', 'emi', 'personal loan', 'home loan'], name: 'Loan Payment' },
    { keywords: ['internet', 'broadband', 'wifi', 'airtel', 'jio', 'bsnl'], name: 'Internet Bill' },
    { keywords: ['mobile', 'phone', 'recharge', 'prepaid', 'postpaid'], name: 'Phone Bill' },
    { keywords: ['water', 'bwssb', 'municipal'], name: 'Water Bill' },
    { keywords: ['insurance', 'policy', 'premium'], name: 'Insurance' },
    { keywords: ['food', 'restaurant', 'cafe', 'zomato', 'swiggy', 'domino'], name: 'Food' },
    { keywords: ['uber', 'ola', 'taxi', 'auto', 'metro', 'bus'], name: 'Transport' },
    { keywords: ['shopping', 'amazon', 'flipkart', 'myntra', 'store'], name: 'Shopping' },
    { keywords: ['medical', 'hospital', 'pharmacy', 'doctor', 'medicine'], name: 'Medical' },
    { keywords: ['rent', 'house rent', 'apartment'], name: 'Rent' }
  ]
  
  for (const mapping of categoryMap) {
    if (mapping.keywords.some(keyword => text.includes(keyword))) {
      const category = categories.find(cat => cat.name === mapping.name)
      if (category) return category.id
    }
  }
  
  // Default to Misc category
  const miscCategory = categories.find(cat => cat.name === 'Misc')
  return miscCategory?.id || categories[0]?.id || ''
}

function extractPaymentMethod(message: string): string {
  const text = message.toLowerCase()
  
  if (text.includes('credit card') || text.includes('cc')) return 'Credit Card'
  if (text.includes('debit card') || text.includes('dc')) return 'Debit Card'
  if (text.includes('upi') || text.includes('gpay') || text.includes('phonepe') || text.includes('paytm')) return 'Digital Wallet'
  if (text.includes('neft') || text.includes('imps') || text.includes('rtgs')) return 'Bank Transfer'
  
  return 'Digital Wallet' // Default for most mobile transactions
}