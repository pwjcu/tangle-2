import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // 여기에 'as any'를 붙여서 빨간 줄을 강제로 없앱니다.
            cookieStore.set({ name, value, ...options } as any)
          },
          remove(name: string, options: CookieOptions) {
            // 여기도 마찬가지입니다.
            cookieStore.set({ name, value: '', ...options } as any)
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}`)
    }
  }

  // 로그인 실패 시 메인으로 이동
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}