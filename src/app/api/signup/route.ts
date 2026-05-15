import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const buildUniqueSlug = (firstName: string, lastName: string) => {
  const base = `${slugify(firstName)}-${slugify(lastName)}`.replace(/^-+|-+$/g, '')
  const fallback = 'therapeute'
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base || fallback}-${suffix}`
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error: 'Supabase service role not configured',
          fallback: true,
        },
        { status: 501 }
      )
    }

    const { firstName, lastName, email, phone, password } = await request.json()

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: userResult, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
      },
    })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    const user = userResult.user

    if (!user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
    }

    const { data: profile, error: profileError } = await adminClient
      .from('therapist_profiles')
      .insert([
        {
          user_id: user.id,
          slug: buildUniqueSlug(firstName, lastName),
          first_name: firstName,
          last_name: lastName,
          phone,
          license_number: '',
          company_name: '',
          company_address: '',
          company_phone: '',
          tax_rate: 20,
          logo_url: '',
          buffer_time: 15,
          bio: '',
          photo_url: '',
          instagram: '',
          specialties: [],
        },
      ])
      .select('*')
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ user, profile }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown signup error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
