import {EnumTokens} from "@/services/auth-token.service";
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest, response: NextResponse) {
  const {url, cookies} = request;

  console.log("cookies", cookies)

  const refreshToken = cookies.get((EnumTokens.REFRESH_TOKEN))?.value;
  const isAuthPage = url.includes('/login');

  //aqve reqeust rolebze;

  if (isAuthPage && refreshToken) {
    return NextResponse.redirect(new URL(url))
  }

  if (isAuthPage) return NextResponse.next();

 if (!refreshToken) return NextResponse.redirect(new URL(`/login`, request.url))

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/:path*'],
}